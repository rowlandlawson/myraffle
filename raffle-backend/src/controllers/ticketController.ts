import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logTransaction } from '../utils/transactions';
import { CONSTANTS } from '../config/constants';
import { initializeMonnifyPayment } from '../services/monnify';
import { checkAndTriggerAutoDraw } from '../services/raffle';
import crypto from 'crypto';


// GET /api/tickets — Get user's tickets (paginated)
export const getUserTickets = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where: any = { userId: req.user!.userId };
        if (status) where.status = status;

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                include: {
                    raffle: {
                        include: {
                            item: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true,
                                    value: true,
                                    category: true,
                                },
                            },
                            winner: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.ticket.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                tickets,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Tickets] Get user tickets error:', error);
        res.status(500).json({ success: false, message: 'Failed to get tickets.' });
    }
};

// GET /api/tickets/:id — Get single ticket
export const getTicketById = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                raffle: {
                    include: {
                        item: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                                value: true,
                                category: true,
                            },
                        },
                        winner: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found.' });
            return;
        }

        // Ensure user can only view their own tickets
        if (ticket.userId !== req.user!.userId) {
            res.status(403).json({ success: false, message: 'Access denied.' });
            return;
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        console.error('[Tickets] Get ticket error:', error);
        res.status(500).json({ success: false, message: 'Failed to get ticket.' });
    }
};

// POST /api/tickets — Buy a ticket
export const buyTicket = async (req: Request, res: Response) => {
    try {
        const { raffleId, paymentMethod, useWallet, quantity } = req.body;
        const userId = req.user!.userId;
        const qty = Math.max(1, Math.min(10, parseInt(quantity) || 1));

        // Get raffle details
        const raffle = await prisma.raffle.findUnique({
            where: { id: raffleId },
            include: { item: true },
        });

        if (!raffle) {
            res.status(404).json({ success: false, message: 'Raffle not found.' });
            return;
        }

        // Validate raffle is active
        if (raffle.status !== 'ACTIVE' && raffle.status !== 'SCHEDULED') {
            res.status(400).json({
                success: false,
                message: 'This raffle is not currently accepting tickets.',
            });
            return;
        }

        // Check tickets available
        const remainingTickets = raffle.ticketsTotal - raffle.ticketsSold;
        if (remainingTickets <= 0) {
            res.status(400).json({
                success: false,
                message: 'All tickets for this raffle have been sold.',
            });
            return;
        }

        if (qty > remainingTickets) {
            res.status(400).json({
                success: false,
                message: `Only ${remainingTickets} ticket(s) remaining for this raffle.`,
            });
            return;
        }

        // Enforce max 10 tickets per user per raffle
        const userTicketCount = await prisma.ticket.count({
            where: { userId, raffleId },
        });

        if (userTicketCount >= 10) {
            res.status(400).json({
                success: false,
                message: 'You have reached the maximum limit of 10 tickets for this raffle.',
            });
            return;
        }

        if (userTicketCount + qty > 10) {
            res.status(400).json({
                success: false,
                message: `You can only buy up to 10 tickets per raffle. You currently own ${userTicketCount} ticket(s), so you can buy at most ${10 - userTicketCount} more.`,
            });
            return;
        }

        // Check user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, walletBalance: true },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        const ticketPrice = raffle.ticketPrice;
        const totalAmount = ticketPrice * qty;
        const availableWallet = Math.max(0, user.walletBalance);

        // Check if user requested wallet payment
        if (paymentMethod === 'wallet') {
            if (availableWallet < totalAmount) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient wallet balance. You have ₦${availableWallet.toLocaleString()} but ${qty} ticket(s) cost ₦${totalAmount.toLocaleString()}. Please pay via Monnify gateway or top up your wallet.`,
                });
                return;
            }

            // Execute ATOMIC TRANSACTION with strict SQL row locks
            // Prevents overselling when 1,000s of users click Buy simultaneously
            try {
                await prisma.$transaction(async (tx) => {
                    // 1. Atomic Wallet Balance Deduction
                    const walletDeducted = await tx.$executeRaw`
                        UPDATE "User"
                        SET "walletBalance" = "walletBalance" - ${totalAmount}
                        WHERE "id" = ${userId}
                          AND "walletBalance" >= ${totalAmount};
                    `;

                    if (walletDeducted === 0) {
                        throw new Error('INSUFFICIENT_WALLET_FUNDS');
                    }

                    // 2. Atomic Ticket Count Reservation (Guarantees NO OVERSELLING)
                    const raffleUpdated = await tx.$executeRaw`
                        UPDATE "Raffle"
                        SET "ticketsSold" = "ticketsSold" + ${qty},
                            "status" = CASE WHEN "status" = 'SCHEDULED' THEN 'ACTIVE'::"RaffleStatus" ELSE "status" END
                        WHERE "id" = ${raffleId}
                          AND "status" IN ('ACTIVE'::"RaffleStatus", 'SCHEDULED'::"RaffleStatus")
                          AND ("ticketsSold" + ${qty}) <= "ticketsTotal";
                    `;

                    if (raffleUpdated === 0) {
                        throw new Error('RAFFLE_SOLD_OUT');
                    }

                    // 3. Batch insert tickets
                    const ticketData = Array.from({ length: qty }).map((_, i) => ({
                        userId,
                        raffleId,
                        ticketNumber: `TKT-${Date.now()}-${i}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
                        status: 'ACTIVE' as const,
                    }));

                    await tx.ticket.createMany({
                        data: ticketData,
                    });
                });
            } catch (txError: any) {
                if (txError.message === 'RAFFLE_SOLD_OUT') {
                    res.status(400).json({
                        success: false,
                        message: 'Sorry! The remaining ticket(s) for this raffle were just purchased by another user. This raffle is now sold out.',
                    });
                    return;
                }
                if (txError.message === 'INSUFFICIENT_WALLET_FUNDS') {
                    res.status(400).json({
                        success: false,
                        message: 'Insufficient wallet balance for this purchase.',
                    });
                    return;
                }
                throw txError;
            }

            await logTransaction({
                userId,
                type: 'TICKET_PURCHASE',
                amount: totalAmount,
                status: 'COMPLETED',
                description: `${qty} Ticket(s) for ${raffle.item.name} (Wallet)`,
            });

            // Check if sold out & auto-draw immediately
            checkAndTriggerAutoDraw(raffleId).catch(err => {
                console.error('[TicketController] Auto-draw check failed:', err);
            });

            res.status(201).json({
                success: true,
                message: `Successfully purchased ${qty} ticket(s)!`,
            });
            return;
        }

        // Gateway / Split Payment (Monnify)
        const applyWallet = useWallet !== false;
        const walletAmountToUse = applyWallet ? Math.min(availableWallet, ticketPrice) : 0;
        const remainingAmountToPay = ticketPrice - walletAmountToUse;

        const paymentRef = `TKT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        let authorizationUrl = '';

        try {
            const monnifyRes = await initializeMonnifyPayment({
                amount: remainingAmountToPay,
                customerName: user.name || user.email,
                customerEmail: user.email,
                paymentReference: paymentRef,
                paymentDescription: `Ticket for ${raffle.item.name}`,
                redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/tickets`,
                metadata: {
                    userId,
                    raffleId,
                    walletDeducted: walletAmountToUse,
                    remainingAmount: remainingAmountToPay,
                    type: 'ticket_purchase',
                },
            });
            authorizationUrl = monnifyRes.checkoutUrl || monnifyRes.redirectUrl;
        } catch (monnifyErr: any) {
            console.error('[Monnify Error]:', monnifyErr.message);
            res.status(400).json({
                success: false,
                message: `Monnify Payment Initialization Error: ${monnifyErr.message}`,
            });
            return;
        }

        await logTransaction({
            userId,
            type: 'TICKET_PURCHASE',
            amount: remainingAmountToPay,
            status: 'PENDING',
            reference: paymentRef,
            description: walletAmountToUse > 0
                ? `Pending Ticket for ${raffle.item.name} (₦${walletAmountToUse.toLocaleString()} wallet + ₦${remainingAmountToPay.toLocaleString()} Monnify)`
                : `Pending Ticket for ${raffle.item.name} (Monnify Gateway)`,
        });

        res.status(200).json({
            success: true,
            isPendingPayment: true,
            message: `Please complete payment of ₦${remainingAmountToPay.toLocaleString()} via Monnify gateway.`,
            data: {
                authorizationUrl,
                reference: paymentRef,
                walletDeducted: walletAmountToUse,
                remainingAmount: remainingAmountToPay,
            },
        });
    } catch (error) {
        console.error('[Tickets] Buy ticket error:', error);
        res.status(500).json({ success: false, message: 'Failed to purchase ticket.' });
    }
};

// GET /api/tickets/history — Full ticket history with stats
export const getTicketHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const [tickets, totalCount, activeCount, wonCount, lostCount] = await Promise.all([
            prisma.ticket.findMany({
                where: { userId },
                include: {
                    raffle: {
                        include: {
                            item: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true,
                                    value: true,
                                    category: true,
                                },
                            },
                            winner: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.ticket.count({ where: { userId } }),
            prisma.ticket.count({ where: { userId, status: 'ACTIVE' } }),
            prisma.ticket.count({ where: { userId, status: 'WON' } }),
            prisma.ticket.count({ where: { userId, status: 'LOST' } }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                tickets,
                stats: {
                    total: totalCount,
                    active: activeCount,
                    won: wonCount,
                    lost: lostCount,
                },
            },
        });
    } catch (error) {
        console.error('[Tickets] Get history error:', error);
        res.status(500).json({ success: false, message: 'Failed to get ticket history.' });
    }
};
