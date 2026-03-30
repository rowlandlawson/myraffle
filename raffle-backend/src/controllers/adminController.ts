import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createTransferRecipient, initiateTransfer } from '../services/paystack';
import { logTransaction } from '../utils/transactions';

// ─── NEW: Dashboard, Users, Transactions, Analytics ──────────

// GET /api/admin/dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalRevenue,
            revenueThisMonth,
            totalUsers,
            activeUsers,
            totalRaffles,
            activeRaffleCount,
            totalTicketsSold,
            winnersThisMonth,
            pendingPayouts,
            failedTransactions,
            recentTx,
            activeRaffles,
        ] = await Promise.all([
            // Total revenue: sum of completed deposits
            prisma.transaction.aggregate({
                where: { type: 'DEPOSIT', status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            // Revenue this month
            prisma.transaction.aggregate({
                where: {
                    type: 'DEPOSIT',
                    status: 'COMPLETED',
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma.user.count(),
            prisma.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
            prisma.raffle.count(),
            prisma.raffle.count({ where: { status: 'ACTIVE' } }),
            prisma.ticket.count(),
            prisma.raffle.count({
                where: { status: 'COMPLETED', updatedAt: { gte: startOfMonth }, winnerUserId: { not: null } },
            }),
            prisma.withdrawal.aggregate({
                where: { status: 'PENDING' },
                _sum: { amount: true },
            }),
            prisma.transaction.count({ where: { status: 'FAILED' } }),
            // Recent 5 transactions
            prisma.transaction.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, userNumber: true } },
                },
            }),
            // Active raffles
            prisma.raffle.findMany({
                where: { status: 'ACTIVE' },
                include: {
                    item: { select: { id: true, name: true, imageUrl: true, value: true } },
                },
                orderBy: { raffleDate: 'asc' },
                take: 10,
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalRevenue: totalRevenue._sum.amount || 0,
                    revenueThisMonth: revenueThisMonth._sum.amount || 0,
                    totalUsers,
                    activeUsers,
                    totalRaffles,
                    activeRaffles: activeRaffleCount,
                    totalTicketsSold,
                    winnersThisMonth,
                    pendingPayouts: pendingPayouts._sum.amount || 0,
                    failedTransactions,
                },
                recentTransactions: recentTx,
                activeRaffles,
            },
        });
    } catch (error) {
        console.error('[Admin] Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get dashboard stats.' });
    }
};

// GET /api/admin/users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search as string | undefined;
        const status = req.query.status as string | undefined;

        const where: any = {};
        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { userNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    userNumber: true,
                    name: true,
                    email: true,
                    phone: true,
                    walletBalance: true,
                    rafflePoints: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: { tickets: true, transactions: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        console.error('[Admin] Get all users error:', error);
        res.status(500).json({ success: false, message: 'Failed to get users.' });
    }
};

// GET /api/admin/transactions
export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const type = req.query.type as string | undefined;
        const status = req.query.status as string | undefined;
        const search = req.query.search as string | undefined;

        const where: any = {};
        if (type && type !== 'all') where.type = type.toUpperCase();
        if (status && status !== 'all') where.status = status.toUpperCase();
        if (search) {
            where.OR = [
                { reference: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { userNumber: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, userNumber: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        console.error('[Admin] Get all transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get transactions.' });
    }
};

// GET /api/admin/analytics?range=7d|30d|90d|1y
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const range = (req.query.range as string) || '7d';
        const now = new Date();
        let rangeStart: Date;
        switch (range) {
            case '30d': rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
            case '90d': rangeStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
            case '1y': rangeStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
            default: rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        }

        const [revenue, newUsers, ticketsSold, activeRaffles, topItems, recentTx, platformTotals] =
            await Promise.all([
                prisma.transaction.aggregate({
                    where: { type: 'DEPOSIT', status: 'COMPLETED', createdAt: { gte: rangeStart } },
                    _sum: { amount: true },
                }),
                prisma.user.count({ where: { createdAt: { gte: rangeStart } } }),
                prisma.ticket.count({ where: { createdAt: { gte: rangeStart } } }),
                prisma.raffle.count({ where: { status: 'ACTIVE' } }),
                // Top items by ticket count
                prisma.raffle.findMany({
                    select: {
                        ticketsSold: true,
                        ticketPrice: true,
                        item: { select: { name: true } },
                    },
                    orderBy: { ticketsSold: 'desc' },
                    take: 5,
                }),
                // Recent activity
                prisma.transaction.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true } },
                    },
                }),
                // All-time platform totals
                Promise.all([
                    prisma.user.count(),
                    prisma.raffle.count(),
                    prisma.ticket.count(),
                    prisma.transaction.aggregate({
                        where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
                        _sum: { amount: true },
                    }),
                ]),
            ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalRevenue: revenue._sum.amount || 0,
                    newUsers,
                    ticketsSold,
                    activeRaffles,
                    revenueChange: 0, // Would require previous period comparison
                    usersChange: 0,
                    ticketsChange: 0,
                },
                topItems: topItems.map((r) => ({
                    name: r.item.name,
                    tickets: r.ticketsSold,
                    revenue: r.ticketsSold * r.ticketPrice,
                })),
                recentActivity: recentTx.map((tx) => ({
                    type: tx.type.toLowerCase(),
                    message: `${tx.user.name}: ${tx.description || tx.type}`,
                    time: tx.createdAt.toISOString(),
                })),
                platformSummary: {
                    totalUsers: platformTotals[0],
                    totalRaffles: platformTotals[1],
                    totalTicketsSold: platformTotals[2],
                    totalPayouts: platformTotals[3]._sum.amount || 0,
                },
            },
        });
    } catch (error) {
        console.error('[Admin] Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics.' });
    }
};

// ─── EXISTING: Withdrawals Management ────────────────────────

// Query params: ?status=PENDING|APPROVED|REJECTED|COMPLETED&page=1&limit=20
export const getWithdrawals = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' } : {};

        const [withdrawals, total] = await Promise.all([
            prisma.withdrawal.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            userNumber: true,
                            name: true,
                            email: true,
                            walletBalance: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.withdrawal.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                withdrawals,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Admin] Get withdrawals error:', error);
        res.status(500).json({ success: false, message: 'Failed to get withdrawals.' });
    }
};

// PUT /api/admin/withdrawals/:id/approve
// Triggers Paystack transfer to the user's bank account
export const approveWithdrawal = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!withdrawal) {
            res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
            return;
        }

        if (withdrawal.status !== 'PENDING') {
            res.status(400).json({
                success: false,
                message: `Cannot approve a withdrawal with status: ${withdrawal.status}`,
            });
            return;
        }

        try {
            // Step 1: Create a Paystack transfer recipient for the user's bank account
            const recipient = await createTransferRecipient(
                withdrawal.accountName,
                withdrawal.accountNumber,
                withdrawal.bankCode
            );

            // Step 2: Initiate the transfer via Paystack
            const transfer = await initiateTransfer(
                withdrawal.amount,
                recipient.recipient_code,
                `RaffleHub withdrawal for ${withdrawal.user.name}`
            );

            // Step 3: Update withdrawal status to COMPLETED
            await prisma.withdrawal.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    adminNote: `Approved by admin. Transfer ref: ${transfer.reference}`,
                },
            });

            // Step 4: Log the completed transaction
            await logTransaction({
                userId: withdrawal.userId,
                type: 'WITHDRAWAL',
                amount: withdrawal.amount,
                status: 'COMPLETED',
                reference: transfer.reference,
                description: `Withdrawal approved. Sent to ${withdrawal.accountName} (${withdrawal.accountNumber})`,
            });

            console.log(`[Admin] Withdrawal ${id} approved. Transfer ref: ${transfer.reference}`);

            res.status(200).json({
                success: true,
                message: 'Withdrawal approved and funds transferred.',
                data: {
                    withdrawalId: id,
                    transferReference: transfer.reference,
                    amount: withdrawal.amount,
                },
            });
        } catch (paystackError) {
            // Paystack transfer failed — mark as APPROVED but not yet transferred
            // Admin can retry later
            console.error('[Admin] Paystack transfer failed:', paystackError);

            await prisma.withdrawal.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    adminNote: `Approved but transfer failed. Error: ${paystackError instanceof Error ? paystackError.message : 'Unknown error'}`,
                },
            });

            res.status(200).json({
                success: true,
                message: 'Withdrawal approved but bank transfer failed. Please retry the transfer.',
                data: {
                    withdrawalId: id,
                    transferFailed: true,
                },
            });
        }
    } catch (error) {
        console.error('[Admin] Approve withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve withdrawal.' });
    }
};

// PUT /api/admin/withdrawals/:id/reject
// Refunds the withdrawal amount back to the user's wallet
export const rejectWithdrawal = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { reason } = req.body;

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id },
        });

        if (!withdrawal) {
            res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
            return;
        }

        if (withdrawal.status !== 'PENDING') {
            res.status(400).json({
                success: false,
                message: `Cannot reject a withdrawal with status: ${withdrawal.status}`,
            });
            return;
        }

        // Reject and refund in a single database transaction
        await prisma.$transaction([
            // Update withdrawal status to REJECTED
            prisma.withdrawal.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    adminNote: reason || 'Rejected by admin.',
                },
            }),
            // Refund the amount back to the user's wallet
            prisma.user.update({
                where: { id: withdrawal.userId },
                data: {
                    walletBalance: { increment: withdrawal.amount },
                },
            }),
        ]);

        // Log the refund transaction
        await logTransaction({
            userId: withdrawal.userId,
            type: 'REFUND',
            amount: withdrawal.amount,
            status: 'COMPLETED',
            description: `Withdrawal rejected. Reason: ${reason || 'No reason provided'}. Amount refunded to wallet.`,
        });

        console.log(`[Admin] Withdrawal ${id} rejected. ₦${withdrawal.amount} refunded.`);

        res.status(200).json({
            success: true,
            message: 'Withdrawal rejected and funds refunded to user wallet.',
            data: {
                withdrawalId: id,
                refundedAmount: withdrawal.amount,
            },
        });
    } catch (error) {
        console.error('[Admin] Reject withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject withdrawal.' });
    }
};

// ─── Task Management ─────────────────────────────────────────

// GET /api/admin/tasks — List all tasks (active + inactive) with completion counts
export const getAllAdminTasks = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { completions: true } },
                },
                skip,
                take: limit,
            }),
            prisma.task.count(),
        ]);

        res.status(200).json({
            success: true,
            data: {
                tasks,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        console.error('[Admin] Get all tasks error:', error);
        res.status(500).json({ success: false, message: 'Failed to get tasks.' });
    }
};

// POST /api/admin/tasks — Create a new task
export const createTask = async (req: Request, res: Response) => {
    try {
        const { type, title, description, points, actionUrl, platform, adDuration, maxCompletions, dailyLimit, expiresAt, priority, isPinned } = req.body;

        if (!type || !title || !description || points === undefined) {
            res.status(400).json({
                success: false,
                message: 'type, title, description, and points are required.',
            });
            return;
        }

        const validTypes = [
            'WATCH_AD_VIDEO', 'WATCH_AD_PICTURE', 'WATCH_AD_BANNER',
            'REFERRAL', 'SURVEY', 'SOCIAL_SHARE',
            'DAILY_LOGIN', 'SOCIAL_LIKE', 'SOCIAL_COMMENT', 'SOCIAL_FOLLOW',
        ];

        if (!validTypes.includes(type)) {
            res.status(400).json({
                success: false,
                message: `Invalid task type. Must be one of: ${validTypes.join(', ')}`,
            });
            return;
        }

        const task = await prisma.task.create({
            data: {
                type,
                title,
                description,
                points: parseInt(points),
                actionUrl: actionUrl || null,
                platform: platform || null,
                adDuration: adDuration ? parseInt(adDuration) : null,
                maxCompletions: maxCompletions ? parseInt(maxCompletions) : null,
                dailyLimit: dailyLimit ? parseInt(dailyLimit) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                priority: priority !== undefined ? parseInt(priority) : 0,
                isPinned: isPinned === true || isPinned === 'true' ? true : false,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully.',
            data: task,
        });
    } catch (error) {
        console.error('[Admin] Create task error:', error);
        res.status(500).json({ success: false, message: 'Failed to create task.' });
    }
};

// PUT /api/admin/tasks/:id — Update an existing task
export const updateTask = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { type, title, description, points, actionUrl, platform, adDuration, maxCompletions, dailyLimit, expiresAt, isActive, priority, isPinned } = req.body;

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...(type !== undefined && { type }),
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(points !== undefined && { points: parseInt(points) }),
                ...(actionUrl !== undefined && { actionUrl: actionUrl || null }),
                ...(platform !== undefined && { platform: platform || null }),
                ...(adDuration !== undefined && { adDuration: adDuration ? parseInt(adDuration) : null }),
                ...(maxCompletions !== undefined && { maxCompletions: maxCompletions ? parseInt(maxCompletions) : null }),
                ...(dailyLimit !== undefined && { dailyLimit: dailyLimit ? parseInt(dailyLimit) : null }),
                ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
                ...(isActive !== undefined && { isActive }),
                ...(priority !== undefined && { priority: parseInt(priority) }),
                ...(isPinned !== undefined && { isPinned: isPinned === true || isPinned === 'true' }),
            },
        });

        res.status(200).json({
            success: true,
            message: 'Task updated successfully.',
            data: task,
        });
    } catch (error) {
        console.error('[Admin] Update task error:', error);
        res.status(500).json({ success: false, message: 'Failed to update task.' });
    }
};

// DELETE /api/admin/tasks/:id — Permanently delete a task
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Task not found.' });
            return;
        }

        // Delete related completions first, then the task itself
        await prisma.$transaction([
            prisma.userTask.deleteMany({ where: { taskId: id } }),
            prisma.task.delete({ where: { id } }),
        ]);

        res.status(200).json({
            success: true,
            message: 'Task deleted permanently.',
        });
    } catch (error) {
        console.error('[Admin] Delete task error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete task.' });
    }
};

// ─── Visitor Analytics ───────────────────────────────────────

// GET /api/admin/analytics/visitors?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getVisitorAnalytics = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : new Date(now.getFullYear(), now.getMonth(), now.getDate()); // today start
        const endDate = req.query.endDate
            ? new Date(new Date(req.query.endDate as string).getTime() + 24 * 60 * 60 * 1000) // end of that day
            : new Date(now.getTime() + 24 * 60 * 60 * 1000); // end of today

        const where = {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
        };

        const [totalVisits, uniqueVisitors, visitsByDay, visitsByPath] = await Promise.all([
            prisma.pageVisit.count({ where }),
            prisma.pageVisit.groupBy({
                by: ['ip'],
                where,
                _count: true,
            }),
            // Group by date
            prisma.$queryRaw`
                SELECT DATE(created_at) as date, COUNT(*)::int as visits
                FROM page_visits
                WHERE created_at >= ${startDate} AND created_at < ${endDate}
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            ` as Promise<{ date: string; visits: number }[]>,
            // Group by path
            prisma.pageVisit.groupBy({
                by: ['path'],
                where,
                _count: true,
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalVisits,
                uniqueVisitors: uniqueVisitors.length,
                visitsByDay,
                visitsByPath: visitsByPath.map(v => ({
                    path: v.path,
                    visits: v._count,
                })),
            },
        });
    } catch (error) {
        console.error('[Admin] Get visitor analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get visitor analytics.' });
    }
};

// ─── Wins Management ─────────────────────────────────────────

// GET /api/admin/wins — List all completed raffles with winners
export const getAdminWins = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const deliveryStatus = req.query.deliveryStatus as string | undefined;

        const where: any = {
            status: 'COMPLETED',
            winnerUserId: { not: null },
        };

        if (deliveryStatus && deliveryStatus !== 'all') {
            where.deliveryStatus = deliveryStatus;
        }

        const [wins, total] = await Promise.all([
            prisma.raffle.findMany({
                where,
                include: {
                    item: {
                        select: { id: true, name: true, imageUrl: true, value: true, category: true },
                    },
                    winner: {
                        select: { id: true, name: true, email: true, userNumber: true, phone: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.raffle.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                wins,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        console.error('[Admin] Get wins error:', error);
        res.status(500).json({ success: false, message: 'Failed to get wins.' });
    }
};

// PUT /api/admin/wins/:raffleId/delivery — Update delivery status
export const updateDeliveryStatus = async (req: Request, res: Response) => {
    try {
        const raffleId = req.params.raffleId as string;
        const { deliveryStatus, deliveryNote } = req.body;

        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
        if (!deliveryStatus || !validStatuses.includes(deliveryStatus)) {
            res.status(400).json({
                success: false,
                message: `deliveryStatus must be one of: ${validStatuses.join(', ')}`,
            });
            return;
        }

        const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
        if (!raffle) {
            res.status(404).json({ success: false, message: 'Raffle not found.' });
            return;
        }

        if (raffle.status !== 'COMPLETED' || !raffle.winnerUserId) {
            res.status(400).json({
                success: false,
                message: 'Can only update delivery for completed raffles with a winner.',
            });
            return;
        }

        const updated = await prisma.raffle.update({
            where: { id: raffleId },
            data: {
                deliveryStatus,
                deliveryNote: deliveryNote || null,
                deliveryUpdatedAt: new Date(),
            },
            include: {
                item: { select: { name: true } },
                winner: { select: { name: true, userNumber: true } },
            },
        });

        console.log(`[Admin] Delivery status updated for raffle ${raffleId}: ${deliveryStatus}`);

        res.status(200).json({
            success: true,
            message: 'Delivery status updated.',
            data: updated,
        });
    } catch (error) {
        console.error('[Admin] Update delivery status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update delivery status.' });
    }
};
