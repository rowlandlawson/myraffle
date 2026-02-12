import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { initializePayment } from '../services/paystack';
import { logTransaction } from '../utils/transactions';

// GET /api/wallet/balance
export const getBalance = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                walletBalance: true,
                rafflePoints: true,
            },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                walletBalance: user.walletBalance,
                rafflePoints: user.rafflePoints,
            },
        });
    } catch (error) {
        console.error('[Wallet] Get balance error:', error);
        res.status(500).json({ success: false, message: 'Failed to get balance.' });
    }
};

// POST /api/wallet/deposit
export const initiateDeposit = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: { email: true },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        // Initialize Paystack payment
        const paymentData = await initializePayment(user.email, amount, {
            userId: req.user!.userId,
            type: 'wallet_deposit',
        });

        // Log pending transaction
        await logTransaction({
            userId: req.user!.userId,
            type: 'DEPOSIT',
            amount,
            status: 'PENDING',
            reference: paymentData.reference,
            description: 'Wallet deposit via Paystack',
        });

        res.status(200).json({
            success: true,
            message: 'Payment initialized.',
            data: {
                authorizationUrl: paymentData.authorization_url,
                reference: paymentData.reference,
            },
        });
    } catch (error) {
        console.error('[Wallet] Deposit error:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize deposit.' });
    }
};

// POST /api/wallet/withdraw
export const requestWithdrawal = async (req: Request, res: Response) => {
    try {
        const { amount, bankCode, accountNumber, accountName } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: { walletBalance: true },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        if (user.walletBalance < amount) {
            res.status(400).json({
                success: false,
                message: 'Insufficient wallet balance.',
            });
            return;
        }

        // Deduct balance and create withdrawal record in a transaction
        const [withdrawal] = await prisma.$transaction([
            prisma.withdrawal.create({
                data: {
                    userId: req.user!.userId,
                    amount,
                    bankCode,
                    accountNumber,
                    accountName,
                    status: 'PENDING',
                },
            }),
            prisma.user.update({
                where: { id: req.user!.userId },
                data: {
                    walletBalance: { decrement: amount },
                },
            }),
        ]);

        // Log the transaction
        await logTransaction({
            userId: req.user!.userId,
            type: 'WITHDRAWAL',
            amount,
            status: 'PENDING',
            description: `Withdrawal to ${accountName} (${accountNumber})`,
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal request submitted. Pending admin approval.',
            data: {
                withdrawalId: withdrawal.id,
                amount: withdrawal.amount,
                status: withdrawal.status,
            },
        });
    } catch (error) {
        console.error('[Wallet] Withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Failed to process withdrawal.' });
    }
};

// GET /api/wallet/transactions
export const getTransactions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId: req.user!.userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({
                where: { userId: req.user!.userId },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Wallet] Get transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get transactions.' });
    }
};
