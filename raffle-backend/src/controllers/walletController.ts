import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { initializeMonnifyPayment } from '../services/monnify';
import { logTransaction } from '../utils/transactions';
import crypto from 'crypto';

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
            select: { email: true, name: true },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        const paymentRef = `DEP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Initialize Monnify payment
        const monnifyRes = await initializeMonnifyPayment({
            amount,
            customerName: user.name || user.email,
            customerEmail: user.email,
            paymentReference: paymentRef,
            paymentDescription: 'Wallet deposit via Monnify',
            redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/earnings`,
            metadata: {
                userId: req.user!.userId,
                type: 'wallet_deposit',
            },
        });

        // Log pending transaction
        await logTransaction({
            userId: req.user!.userId,
            type: 'DEPOSIT',
            amount,
            status: 'PENDING',
            reference: paymentRef,
            description: 'Wallet deposit via Monnify',
        });

        res.status(200).json({
            success: true,
            message: 'Monnify payment initialized.',
            data: {
                authorizationUrl: monnifyRes.checkoutUrl || monnifyRes.redirectUrl,
                reference: paymentRef,
            },
        });
    } catch (error) {
        console.error('[Wallet] Deposit error:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize deposit.' });
    }
};

// POST /api/wallet/withdraw
export const requestWithdrawal = async (req: Request, res: Response) => {
    res.status(400).json({
        success: false,
        message: 'Direct cash withdrawals are not supported. Store credits in your wallet are non-withdrawable and can be used to participate in raffles and purchase tickets on the platform.',
    });
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
