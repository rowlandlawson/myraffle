import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logTransaction } from '../utils/transactions';
import { CONSTANTS } from '../config/constants';

// Map TaskType enum to its point value from constants
const TASK_POINTS: Record<string, number> = {
    WATCH_AD: CONSTANTS.POINTS.WATCH_AD_30S,
    REFERRAL: CONSTANTS.POINTS.REFERRAL_BONUS,
    SURVEY: CONSTANTS.POINTS.SURVEY_COMPLETE,
    SOCIAL_SHARE: CONSTANTS.POINTS.WHATSAPP_SHARE,
    DAILY_LOGIN: CONSTANTS.POINTS.DAILY_LOGIN,
};

// GET /api/tasks — Get available tasks (public)
export const getAvailableTasks = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.task.count({ where: { isActive: true } }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Tasks] Get available tasks error:', error);
        res.status(500).json({ success: false, message: 'Failed to get tasks.' });
    }
};

// GET /api/tasks/:id — Get task details
export const getTaskById = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);

        const task = await prisma.task.findUnique({ where: { id } });

        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        console.error('[Tasks] Get task error:', error);
        res.status(500).json({ success: false, message: 'Failed to get task.' });
    }
};

// POST /api/tasks/:id/complete — Complete a task and earn points (protected)
export const completeTask = async (req: Request, res: Response) => {
    try {
        const taskId: string = String(req.params.id);
        const userId = req.user!.userId;

        // Find the task
        const task = await prisma.task.findUnique({ where: { id: taskId } });

        if (!task) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        if (!task.isActive) {
            res.status(400).json({ success: false, message: 'This task is no longer available.' });
            return;
        }

        // Referral tasks are handled automatically in authController on email verification
        if (task.type === 'REFERRAL') {
            res.status(400).json({
                success: false,
                message: 'Referral rewards are awarded automatically when your referred friend verifies their email.',
            });
            return;
        }

        // DAILY_LOGIN: check if already completed today
        if (task.type === 'DAILY_LOGIN') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const alreadyDoneToday = await prisma.userTask.findFirst({
                where: {
                    userId,
                    taskId,
                    completedAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            });

            if (alreadyDoneToday) {
                res.status(400).json({
                    success: false,
                    message: 'You have already completed this daily task today. Come back tomorrow!',
                });
                return;
            }
        }

        // Determine points to award (use task.points from DB, fallback to constants)
        const pointsToAward = task.points || TASK_POINTS[task.type] || 0;

        if (pointsToAward <= 0) {
            res.status(400).json({ success: false, message: 'This task has no point reward configured.' });
            return;
        }

        // Award points and create records in a transaction
        const [userTask, updatedUser] = await prisma.$transaction([
            // Create UserTask completion record
            prisma.userTask.create({
                data: {
                    userId,
                    taskId,
                    pointsEarned: pointsToAward,
                },
            }),
            // Increment user's raffle points
            prisma.user.update({
                where: { id: userId },
                data: { rafflePoints: { increment: pointsToAward } },
                select: { rafflePoints: true },
            }),
        ]);

        // Log the transaction for audit trail
        await logTransaction({
            userId,
            type: 'TASK_REWARD',
            amount: pointsToAward,
            status: 'COMPLETED',
            description: `Earned ${pointsToAward} points for completing task: ${task.title}`,
        });

        res.status(200).json({
            success: true,
            message: `Task completed! You earned ${pointsToAward} raffle points.`,
            data: {
                taskCompletion: userTask,
                pointsEarned: pointsToAward,
                totalPoints: updatedUser.rafflePoints,
            },
        });
    } catch (error) {
        console.error('[Tasks] Complete task error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete task.' });
    }
};

// GET /api/tasks/completed — Get user's completed tasks (protected)
export const getCompletedTasks = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [completedTasks, total, totalPointsResult] = await Promise.all([
            prisma.userTask.findMany({
                where: { userId },
                include: {
                    task: {
                        select: {
                            id: true,
                            type: true,
                            title: true,
                            description: true,
                            points: true,
                        },
                    },
                },
                orderBy: { completedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.userTask.count({ where: { userId } }),
            prisma.userTask.aggregate({
                where: { userId },
                _sum: { pointsEarned: true },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                completedTasks,
                summary: {
                    totalTasksCompleted: total,
                    totalPointsEarned: totalPointsResult._sum.pointsEarned || 0,
                },
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Tasks] Get completed tasks error:', error);
        res.status(500).json({ success: false, message: 'Failed to get completed tasks.' });
    }
};
