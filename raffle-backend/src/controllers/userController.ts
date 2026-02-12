import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/users/profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                userNumber: true,
                email: true,
                name: true,
                phone: true,
                walletBalance: true,
                rafflePoints: true,
                role: true,
                status: true,
                emailVerified: true,
                referredBy: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        console.error('[User] Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to get profile.' });
    }
};

// PUT /api/users/profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, phone } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user!.userId },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone }),
            },
            select: {
                id: true,
                userNumber: true,
                email: true,
                name: true,
                phone: true,
                walletBalance: true,
                rafflePoints: true,
                role: true,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: { user },
        });
    } catch (error) {
        console.error('[User] Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
};

// GET /api/users/statistics
export const getUserStatistics = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const [user, ticketCount, winCount, transactionCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { walletBalance: true, rafflePoints: true },
            }),
            prisma.ticket.count({ where: { userId } }),
            prisma.ticket.count({ where: { userId, status: 'WON' } }),
            prisma.transaction.count({ where: { userId } }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                walletBalance: user?.walletBalance || 0,
                rafflePoints: user?.rafflePoints || 0,
                totalTickets: ticketCount,
                totalWins: winCount,
                totalTransactions: transactionCount,
            },
        });
    } catch (error) {
        console.error('[User] Get statistics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get statistics.' });
    }
};

// PUT /api/users/suspend — Admin only
export const suspendUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        if (user.role === 'ADMIN') {
            res.status(403).json({ success: false, message: 'Cannot suspend an admin.' });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { status: 'SUSPENDED' },
        });

        res.status(200).json({ success: true, message: 'User suspended successfully.' });
    } catch (error) {
        console.error('[User] Suspend error:', error);
        res.status(500).json({ success: false, message: 'Failed to suspend user.' });
    }
};

// PUT /api/users/activate — Admin only
export const activateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' },
        });

        res.status(200).json({ success: true, message: 'User activated successfully.' });
    } catch (error) {
        console.error('[User] Activate error:', error);
        res.status(500).json({ success: false, message: 'Failed to activate user.' });
    }
};
