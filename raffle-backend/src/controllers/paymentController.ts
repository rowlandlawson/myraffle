import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/environment';
import {
    initializePayment as paystackInitialize,
    verifyPayment as paystackVerify,
} from '../services/paystack';
import { logTransaction } from '../utils/transactions';
import { checkAndTriggerAutoDraw } from '../services/raffle';

// POST /api/payments/initialize
export const initializePayment = async (req: Request, res: Response) => {
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

        const paymentData = await paystackInitialize(user.email, amount, {
            userId: req.user!.userId,
            type: 'payment',
        });

        // Log pending transaction
        await logTransaction({
            userId: req.user!.userId,
            type: 'DEPOSIT',
            amount,
            status: 'PENDING',
            reference: paymentData.reference,
            description: 'Payment via Paystack',
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
        console.error('[Payment] Initialize error:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize payment.' });
    }
};

// POST /api/payments/verify
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { reference } = req.body;

        // Verify with Paystack
        const paymentData = await paystackVerify(reference);

        if (paymentData.status !== 'success') {
            // Update transaction to failed
            await prisma.transaction.updateMany({
                where: { reference },
                data: { status: 'FAILED' },
            });

            res.status(400).json({
                success: false,
                message: `Payment not successful. Status: ${paymentData.status}`,
            });
            return;
        }

        // Check if already processed (idempotency)
        const existingTransaction = await prisma.transaction.findUnique({
            where: { reference },
        });

        if (existingTransaction && existingTransaction.status === 'COMPLETED') {
            res.status(200).json({
                success: true,
                message: 'Payment already processed.',
            });
            return;
        }

        // Amount from Paystack is in kobo, convert to Naira
        const amountInNaira = paymentData.amount / 100;
        const metadata = (paymentData.metadata || {}) as any;

        if (existingTransaction?.type === 'TICKET_PURCHASE' || metadata?.type === 'ticket_purchase') {
            const raffleId = metadata?.raffleId;
            const targetUserId = metadata?.userId || req.user!.userId;

            if (raffleId) {
                const existingTicket = await prisma.ticket.findFirst({
                    where: { userId: targetUserId, raffleId },
                });

                if (!existingTicket) {
                    const ticketNumber = metadata?.ticketNumber || `TKT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
                    await prisma.$transaction([
                        prisma.ticket.create({
                            data: {
                                userId: targetUserId,
                                raffleId,
                                ticketNumber,
                                status: 'ACTIVE',
                            },
                        }),
                        prisma.raffle.update({
                            where: { id: raffleId },
                            data: {
                                ticketsSold: { increment: 1 },
                                status: 'ACTIVE',
                            },
                        }),
                        prisma.transaction.updateMany({
                            where: { reference },
                            data: { status: 'COMPLETED' },
                        }),
                    ]);

                    checkAndTriggerAutoDraw(raffleId).catch(err => {
                        console.error('[Payment] Auto-draw check failed:', err);
                    });
                } else {
                    await prisma.transaction.updateMany({
                        where: { reference },
                        data: { status: 'COMPLETED' },
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Ticket payment verified and ticket issued successfully!',
                    data: {
                        amount: amountInNaira,
                        reference: paymentData.reference,
                    },
                });
                return;
            }
        }

        // Credit wallet for normal DEPOSIT transactions
        await prisma.$transaction([
            prisma.user.update({
                where: { id: req.user!.userId },
                data: {
                    walletBalance: { increment: amountInNaira },
                },
            }),
            prisma.transaction.updateMany({
                where: { reference },
                data: { status: 'COMPLETED' },
            }),
        ]);

        res.status(200).json({
            success: true,
            message: 'Payment verified and wallet credited.',
            data: {
                amount: amountInNaira,
                reference: paymentData.reference,
            },
        });
    } catch (error) {
        console.error('[Payment] Verify error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment.' });
    }
};

// POST /api/payments/webhook
// Public endpoint — no auth required. Validated via Paystack HMAC signature.
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        // Validate Paystack signature
        const secret = env.PAYSTACK_SECRET_KEY;
        if (!secret) {
            console.error('[Webhook] PAYSTACK_SECRET_KEY not set.');
            res.status(500).json({ success: false, message: 'Server configuration error.' });
            return;
        }

        const hash = crypto
            .createHmac('sha512', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            res.status(401).json({ success: false, message: 'Invalid signature.' });
            return;
        }

        const event = req.body;

        // Handle successful charge
        if (event.event === 'charge.success') {
            const { reference, amount } = event.data;
            const amountInNaira = amount / 100;
            const metadata = event.data.metadata || {};

            // Check if already processed
            const existingTransaction = await prisma.transaction.findUnique({
                where: { reference },
            });

            if (existingTransaction && existingTransaction.status === 'COMPLETED') {
                res.status(200).json({ success: true });
                return;
            }

            if (existingTransaction?.type === 'TICKET_PURCHASE' || metadata?.type === 'ticket_purchase') {
                const raffleId = metadata?.raffleId;
                const targetUserId = metadata?.userId || existingTransaction?.userId;

                if (raffleId && targetUserId) {
                    const existingTicket = await prisma.ticket.findFirst({
                        where: { userId: targetUserId, raffleId },
                    });

                    if (!existingTicket) {
                        const ticketNumber = metadata?.ticketNumber || `TKT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
                        await prisma.$transaction([
                            prisma.ticket.create({
                                data: {
                                    userId: targetUserId,
                                    raffleId,
                                    ticketNumber,
                                    status: 'ACTIVE',
                                },
                            }),
                            prisma.raffle.update({
                                where: { id: raffleId },
                                data: {
                                    ticketsSold: { increment: 1 },
                                    status: 'ACTIVE',
                                },
                            }),
                            prisma.transaction.updateMany({
                                where: { reference },
                                data: { status: 'COMPLETED' },
                            }),
                        ]);

                        checkAndTriggerAutoDraw(raffleId).catch(err => {
                            console.error('[Webhook] Auto-draw check failed:', err);
                        });
                    } else {
                        await prisma.transaction.updateMany({
                            where: { reference },
                            data: { status: 'COMPLETED' },
                        });
                    }
                    console.log(`[Webhook] Issued ticket for user ${targetUserId} in raffle ${raffleId}`);
                }
            } else if (existingTransaction) {
                // Credit wallet and update transaction
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: existingTransaction.userId },
                        data: {
                            walletBalance: { increment: amountInNaira },
                        },
                    }),
                    prisma.transaction.update({
                        where: { id: existingTransaction.id },
                        data: { status: 'COMPLETED' },
                    }),
                ]);

                console.log(`[Webhook] Credited ₦${amountInNaira} to user ${existingTransaction.userId}`);
            } else if (metadata?.userId) {
                // Unknown transaction — default to wallet deposit if metadata userId present
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: metadata.userId },
                        data: {
                            walletBalance: { increment: amountInNaira },
                        },
                    }),
                    prisma.transaction.create({
                        data: {
                            userId: metadata.userId,
                            type: 'DEPOSIT',
                            amount: amountInNaira,
                            status: 'COMPLETED',
                            reference,
                            description: 'Deposit via Paystack webhook',
                        },
                    }),
                ]);

                console.log(`[Webhook] Created and credited ₦${amountInNaira} to user ${metadata.userId}`);
            }
        }

        // Always acknowledge webhook with 200
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('[Webhook] Error:', error);
        // Still return 200 to prevent Paystack from retrying
        res.status(200).json({ success: true });
    }
};

// GET /api/payments/history
export const getPaymentHistory = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    userId: req.user!.userId,
                    type: { in: ['DEPOSIT', 'WITHDRAWAL'] },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({
                where: {
                    userId: req.user!.userId,
                    type: { in: ['DEPOSIT', 'WITHDRAWAL'] },
                },
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
        console.error('[Payment] History error:', error);
        res.status(500).json({ success: false, message: 'Failed to get payment history.' });
    }
};
