import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logTransaction } from '../utils/transactions';
import { CONSTANTS } from '../config/constants';
import { initializePayment as paystackInitialize } from '../services/paystack';
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
        const { raffleId, paymentMethod, useWallet } = req.body;
        const userId = req.user!.userId;

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
        if (raffle.ticketsSold >= raffle.ticketsTotal) {
            res.status(400).json({
                success: false,
                message: 'All tickets for this raffle have been sold.',
            });
            return;
        }

        // Enforce 1 ticket per user per raffle
        const existingTicket = await prisma.ticket.findFirst({
            where: { userId, raffleId },
        });

        if (existingTicket) {
            res.status(400).json({
                success: false,
                message: 'You already have a ticket for this raffle.',
            });
            return;
        }

        // Check user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, walletBalance: true },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        const ticketPrice = raffle.ticketPrice;
        const availableWallet = Math.max(0, user.walletBalance);

        // Determine if wallet balance should be applied
        const isWalletOnly = paymentMethod === 'wallet' && useWallet === false;
        const isGatewayOnly = paymentMethod === 'paystack' || paymentMethod === 'monnify' || paymentMethod === 'gateway';
        const applyWallet = useWallet !== false && !isGatewayOnly;

        const walletAmountToUse = applyWallet ? Math.min(availableWallet, ticketPrice) : 0;
        const remainingAmountToPay = ticketPrice - walletAmountToUse;

        // SCENARIO 1: Full Payment via Wallet (100% covered)
        if (remainingAmountToPay <= 0) {
            const ticketNumber = `TKT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

            const [ticket] = await prisma.$transaction([
                prisma.ticket.create({
                    data: {
                        userId,
                        raffleId,
                        ticketNumber,
                        status: 'ACTIVE',
                    },
                    include: {
                        raffle: {
                            include: {
                                item: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrl: true,
                                        value: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                prisma.raffle.update({
                    where: { id: raffleId },
                    data: {
                        ticketsSold: { increment: 1 },
                        ...(raffle.status === 'SCHEDULED' ? { status: 'ACTIVE' } : {}),
                    },
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: { walletBalance: { decrement: ticketPrice } },
                }),
            ]);

            await logTransaction({
                userId,
                type: 'TICKET_PURCHASE',
                amount: ticketPrice,
                status: 'COMPLETED',
                description: `Ticket for ${raffle.item.name} (Wallet)`,
            });

            // Check if sold out & auto-draw immediately
            checkAndTriggerAutoDraw(raffleId).catch(err => {
                console.error('[TicketController] Auto-draw check failed:', err);
            });

            res.status(201).json({
                success: true,
                message: 'Ticket purchased successfully!',
                data: ticket,
            });
            return;
        }

        // SCENARIO 2: Insufficient Wallet for Wallet-Only Option
        if (isWalletOnly) {
            res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. You need ₦${ticketPrice.toLocaleString()} but have ₦${availableWallet.toLocaleString()}. Use split payment to pay remaining ₦${remainingAmountToPay.toLocaleString()} online.`,
            });
            return;
        }

        // SCENARIO 3: Split Payment / Online Gateway Payment
        const paymentData = await paystackInitialize(user.email, remainingAmountToPay, {
            userId,
            raffleId,
            walletDeducted: walletAmountToUse,
            remainingAmount: remainingAmountToPay,
            type: 'ticket_purchase',
        });

        // If using partial wallet balance, deduct it now
        if (walletAmountToUse > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { walletBalance: { decrement: walletAmountToUse } },
            });
        }

        await logTransaction({
            userId,
            type: 'TICKET_PURCHASE',
            amount: remainingAmountToPay,
            status: 'PENDING',
            reference: paymentData.reference,
            description: walletAmountToUse > 0
                ? `Ticket for ${raffle.item.name} (₦${walletAmountToUse.toLocaleString()} wallet + ₦${remainingAmountToPay.toLocaleString()} online)`
                : `Ticket for ${raffle.item.name} (Online Gateway)`,
        });

        res.status(200).json({
            success: true,
            isPendingPayment: true,
            message: `Please complete payment of ₦${remainingAmountToPay.toLocaleString()} via online gateway.`,
            data: {
                authorizationUrl: paymentData.authorization_url,
                reference: paymentData.reference,
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
