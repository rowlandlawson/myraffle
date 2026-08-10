import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { verifyMonnifySignature } from '../services/monnify';
import { checkAndTriggerAutoDraw } from '../services/raffle';
import crypto from 'crypto';

/**
 * Handle Monnify Webhook Notification
 * URL: POST /api/payments/monnify-webhook
 */
export const handleMonnifyWebhook = async (req: Request, res: Response) => {
    try {
        const signature = (req.headers['monnify-signature'] || req.headers['x-monnify-signature']) as string;

        // Verify Signature
        if (!signature || !verifyMonnifySignature(req.body, signature)) {
            console.error('[Monnify Webhook] Invalid signature verification hash');
            res.status(400).json({ success: false, message: 'Invalid signature' });
            return;
        }

        const { eventType, eventData } = req.body;

        // Handle successful payment transaction
        if (eventType === 'SUCCESSFUL_TRANSACTION' && eventData) {
            const { paymentReference, amountPaid, metaData } = eventData;
            const reference = paymentReference;

            const existingTransaction = await prisma.transaction.findFirst({
                where: { reference },
            });

            const metadata = metaData || {};

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
                            console.error('[Monnify Webhook] Auto-draw check failed:', err);
                        });
                    } else {
                        await prisma.transaction.updateMany({
                            where: { reference },
                            data: { status: 'COMPLETED' },
                        });
                    }
                }
            } else {
                // Deposit transaction credit
                const targetUserId = existingTransaction?.userId || metadata?.userId;
                if (targetUserId) {
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: targetUserId },
                            data: { walletBalance: { increment: amountPaid } },
                        }),
                        prisma.transaction.updateMany({
                            where: { reference },
                            data: { status: 'COMPLETED' },
                        }),
                    ]);
                }
            }
        }

        res.status(200).json({ success: true, message: 'Monnify webhook processed successfully' });
    } catch (error) {
        console.error('[Monnify Webhook] Processing error:', error);
        res.status(500).json({ success: false, message: 'Monnify webhook processing error' });
    }
};
