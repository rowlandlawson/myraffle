import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logTransaction } from '../utils/transactions';
import { CONSTANTS } from '../config/constants';

// Map TaskType enum to its point value from constants
const TASK_POINTS: Record<string, number> = {
    WATCH_AD_VIDEO: CONSTANTS.POINTS.WATCH_AD_VIDEO,
    WATCH_AD_PICTURE: CONSTANTS.POINTS.WATCH_AD_PICTURE,
    WATCH_AD_BANNER: CONSTANTS.POINTS.WATCH_AD_BANNER,
    REFERRAL: CONSTANTS.POINTS.REFERRAL_BONUS,
    SURVEY: CONSTANTS.POINTS.SURVEY_COMPLETE,
    SOCIAL_SHARE: CONSTANTS.POINTS.WHATSAPP_SHARE,
    DAILY_LOGIN: CONSTANTS.POINTS.DAILY_LOGIN,
};

const MAX_DAILY_TASK_SLOTS = 5;

// GET /api/tasks — Get available tasks (auth-aware drip-feed)
export const getAvailableTasks = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        // Fetch all active tasks
        const allTasks = await prisma.task.findMany({
            where: { isActive: true },
            orderBy: [
                { isPinned: 'desc' },
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        // If no logged-in user, return all active tasks (landing page preview)
        if (!userId) {
            res.status(200).json({
                success: true,
                data: {
                    tasks: allTasks,
                    pagination: { page: 1, limit: allTasks.length, total: allTasks.length, totalPages: 1 },
                },
            });
            return;
        }

        // ─── Auth-aware drip-feed ─────────────────────────

        // Get ALL completions for this user
        const completions = await prisma.userTask.findMany({
            where: { userId },
            select: { taskId: true, completedAt: true },
            orderBy: { completedAt: 'desc' },
        });

        // Build a map: taskId -> most recent completedAt
        const completionMap = new Map<string, Date>();
        for (const c of completions) {
            if (!completionMap.has(c.taskId)) {
                completionMap.set(c.taskId, c.completedAt);
            }
        }

        const now = new Date();
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Filter tasks based on type-specific rules
        const availableTasks = allTasks.filter((task) => {
            const lastCompleted = completionMap.get(task.id);

            // SOCIAL_* — one-time only. Hide 12hrs after completion.
            if (task.type.startsWith('SOCIAL_')) {
                if (!lastCompleted) return true; // Not yet completed
                // Still within 12hr grace period — show as completed (frontend disables button)
                return lastCompleted > twelveHoursAgo;
            }

            // DAILY_LOGIN — show if not completed today
            if (task.type === 'DAILY_LOGIN') {
                if (!lastCompleted) return true;
                // Already claimed today — still show card (frontend shows "Claimed")
                return true;
            }

            // WATCH_AD_* — if no dailyLimit, one-time only (hide once completed)
            if (task.type.startsWith('WATCH_AD')) {
                if (!task.dailyLimit && lastCompleted) return false;
                return true;
            }

            // REFERRAL — always show (completions are automatic)
            if (task.type === 'REFERRAL') {
                return true;
            }

            // All other task types — hide once completed forever
            if (lastCompleted) return false;
            return true;
        });

        // Apply slot limit: pinned always included, then fill remaining slots
        const pinnedTasks = availableTasks.filter((t) => t.isPinned);
        const unpinnedTasks = availableTasks.filter((t) => !t.isPinned);
        const remainingSlots = Math.max(0, MAX_DAILY_TASK_SLOTS - pinnedTasks.length);
        const curatedTasks = [...pinnedTasks, ...unpinnedTasks.slice(0, remainingSlots)];

        // Attach completion metadata for the frontend
        const tasksWithMeta = curatedTasks.map((task) => {
            const lastCompleted = completionMap.get(task.id);
            let completedToday = false;
            let recentlyCompleted = false;

            if (lastCompleted) {
                completedToday = lastCompleted >= todayStart;
                recentlyCompleted = lastCompleted > twelveHoursAgo;
            }

            return {
                ...task,
                completedToday,
                recentlyCompleted,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                tasks: tasksWithMeta,
                pagination: {
                    page: 1,
                    limit: curatedTasks.length,
                    total: curatedTasks.length,
                    totalPages: 1,
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

        // Determine points to award (use task.points from DB, fallback to constants)
        const pointsToAward = task.points || TASK_POINTS[task.type] || 0;

        if (pointsToAward <= 0) {
            res.status(400).json({ success: false, message: 'This task has no point reward configured.' });
            return;
        }

        // Use an interactive transaction with serializable isolation to prevent
        // race conditions where two concurrent requests both pass the duplicate check.
        const result = await prisma.$transaction(async (tx) => {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            // DAILY_LOGIN: check if already completed today
            if (task.type === 'DAILY_LOGIN') {
                const alreadyDoneToday = await tx.userTask.findFirst({
                    where: {
                        userId,
                        taskId,
                        completedAt: { gte: todayStart, lte: todayEnd },
                    },
                });

                if (alreadyDoneToday) {
                    return { error: 'You have already completed this daily task today. Come back tomorrow!' };
                }
            }

            // SOCIAL TASKS: duplicate-completion guard
            if (task.type.startsWith('SOCIAL_')) {
                const alreadyCompleted = await tx.userTask.findFirst({
                    where: { userId, taskId },
                });
                if (alreadyCompleted) {
                    return { error: 'You have already completed this social task. Rewards can only be claimed once.' };
                }
            }

            // WATCH_AD TASKS: one-time completion guard (unless dailyLimit is set)
            if (task.type.startsWith('WATCH_AD') && !task.dailyLimit) {
                const alreadyCompleted = await tx.userTask.findFirst({
                    where: { userId, taskId },
                });
                if (alreadyCompleted) {
                    return { error: 'You have already completed this task.' };
                }
            }

            // DAILY LIMIT: check if the task has a dailyLimit and the user has reached it today
            if (task.dailyLimit && task.dailyLimit > 0) {
                const completionsToday = await tx.userTask.count({
                    where: {
                        userId,
                        taskId,
                        completedAt: { gte: todayStart, lte: todayEnd },
                    },
                });

                if (completionsToday >= task.dailyLimit) {
                    return { error: `You've reached the daily limit of ${task.dailyLimit} for this task. Check back tomorrow!` };
                }
            }

            // All checks passed — award points atomically
            const userTask = await tx.userTask.create({
                data: { userId, taskId, pointsEarned: pointsToAward },
            });
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { rafflePoints: { increment: pointsToAward } },
                select: { rafflePoints: true },
            });

            return { userTask, updatedUser };
        });

        // Handle validation errors returned from within the transaction
        if ('error' in result) {
            res.status(400).json({ success: false, message: result.error });
            return;
        }

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
                taskCompletion: result.userTask,
                pointsEarned: pointsToAward,
                totalPoints: result.updatedUser.rafflePoints,
            },
        });
    } catch (error) {
        console.error('[Tasks] Complete task error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete task.' });
    }
};

// GET /api/tasks/completed — Get user's completed tasks (protected)
// Supports ?range=today|week|month|year|all (default: all)
export const getCompletedTasks = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const range = (req.query.range as string) || 'all';

        // Calculate date range
        const now = new Date();
        let rangeStart: Date | null = null;

        switch (range) {
            case 'today': {
                rangeStart = new Date(now);
                rangeStart.setHours(0, 0, 0, 0);
                break;
            }
            case 'week': {
                rangeStart = new Date(now);
                rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay()); // Start of week (Sunday)
                rangeStart.setHours(0, 0, 0, 0);
                break;
            }
            case 'month': {
                rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            }
            case 'year': {
                rangeStart = new Date(now.getFullYear(), 0, 1);
                break;
            }
            default: // 'all'
                rangeStart = null;
        }

        const where: any = { userId };
        if (rangeStart) {
            where.completedAt = { gte: rangeStart };
        }

        const [completedTasks, total, totalPointsResult, uniqueTaskCount] = await Promise.all([
            prisma.userTask.findMany({
                where,
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
            prisma.userTask.count({ where }),
            prisma.userTask.aggregate({
                where,
                _sum: { pointsEarned: true },
            }),
            // Count unique tasks completed (not total completion records)
            prisma.userTask.groupBy({
                by: ['taskId'],
                where,
            }).then(groups => groups.length),
        ]);

        res.status(200).json({
            success: true,
            data: {
                completedTasks,
                summary: {
                    totalTasksCompleted: uniqueTaskCount,
                    totalCompletionRecords: total,
                    totalPointsEarned: totalPointsResult._sum.pointsEarned || 0,
                    range,
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
