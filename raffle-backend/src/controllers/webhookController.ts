import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logTransaction } from '../utils/transactions';

/**
 * POST /api/webhooks/ad-completed
 * 
 * Receives a Server-to-Server (S2S) Postback from the ad network
 * when a user finishes watching/viewing an ad.
 * 
 * Expected query params (standard ad network postback format):
 *   - userId: the user's ID (passed as subId when requesting the ad)
 *   - taskId: the task ID (passed as custom param)
 *   - token:  a secret token to verify the request is legitimate
 *
 * This is NOT called by your frontend — it is called by the ad network's servers.
 */
export const handleAdCompleted = async (req: Request, res: Response) => {
    try {
        const { userId, taskId, token } = req.query as Record<string, string>;

        // 1. Validate required params
        if (!userId || !taskId || !token) {
            res.status(400).json({ success: false, message: 'Missing required parameters.' });
            return;
        }

        // 2. Verify the secret token (set this in your .env as AD_WEBHOOK_SECRET)
        const webhookSecret = process.env.AD_WEBHOOK_SECRET || 'your-ad-webhook-secret';
        if (token !== webhookSecret) {
            console.warn('[Webhook] Invalid ad webhook token received.');
            res.status(403).json({ success: false, message: 'Invalid token.' });
            return;
        }

        // 3. Find the task
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || !task.isActive) {
            res.status(404).json({ success: false, message: 'Task not found or inactive.' });
            return;
        }

        // 4. Check daily limit
        if (task.dailyLimit && task.dailyLimit > 0) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const completionsToday = await prisma.userTask.count({
                where: {
                    userId,
                    taskId,
                    completedAt: { gte: todayStart, lte: todayEnd },
                },
            });

            if (completionsToday >= task.dailyLimit) {
                res.status(200).json({ success: false, message: 'Daily limit reached.' });
                return;
            }
        }

        // 5. Award points
        const pointsToAward = task.points;

        const [userTask, updatedUser] = await prisma.$transaction([
            prisma.userTask.create({
                data: { userId, taskId, pointsEarned: pointsToAward },
            }),
            prisma.user.update({
                where: { id: userId },
                data: { rafflePoints: { increment: pointsToAward } },
                select: { rafflePoints: true },
            }),
        ]);

        await logTransaction({
            userId,
            type: 'TASK_REWARD',
            amount: pointsToAward,
            status: 'COMPLETED',
            description: `Earned ${pointsToAward} points for ad task: ${task.title}`,
        });

        console.log(`[Webhook] Ad completed: user=${userId}, task=${taskId}, points=${pointsToAward}`);

        // Ad networks expect a simple "1" or "OK" response
        res.status(200).send('OK');
    } catch (error) {
        console.error('[Webhook] Ad completed error:', error);
        res.status(500).json({ success: false, message: 'Internal error.' });
    }
};
