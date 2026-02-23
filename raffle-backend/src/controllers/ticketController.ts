import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logTransaction } from '../utils/transactions';
import { CONSTANTS } from '../config/constants';
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
        const { id } = req.params;

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
        const { raffleId, paymentMethod } = req.body;
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

        // Check user has sufficient balance/points
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { walletBalance: true, rafflePoints: true },
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        const ticketPrice = raffle.ticketPrice;

        if (paymentMethod === 'wallet') {
            if (user.walletBalance < ticketPrice) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient wallet balance. You need ₦${ticketPrice.toLocaleString()} but have ₦${user.walletBalance.toLocaleString()}.`,
                });
                return;
            }
        } else if (paymentMethod === 'points') {
            // Convert price to points: ₦100 = 1,000 points
            const pointsNeeded = ticketPrice * 10;
            if (user.rafflePoints < pointsNeeded) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient raffle points. You need ${pointsNeeded.toLocaleString()} points but have ${user.rafflePoints.toLocaleString()}.`,
                });
                return;
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment method. Must be "wallet" or "points".',
            });
            return;
        }

        // Generate unique ticket number
        const ticketNumber = `TKT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Execute purchase in a transaction
        const [ticket] = await prisma.$transaction([
            // Create the ticket
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

            // Increment tickets sold
            prisma.raffle.update({
                where: { id: raffleId },
                data: {
                    ticketsSold: { increment: 1 },
                    // Auto-activate if still scheduled and first ticket
                    ...(raffle.status === 'SCHEDULED' ? { status: 'ACTIVE' } : {}),
                },
            }),

            // Deduct from user balance or points
            prisma.user.update({
                where: { id: userId },
                data:
                    paymentMethod === 'wallet'
                        ? { walletBalance: { decrement: ticketPrice } }
                        : { rafflePoints: { decrement: ticketPrice * 10 } },
            }),
        ]);

        // Log the transaction
        await logTransaction({
            userId,
            type: 'TICKET_PURCHASE',
            amount: ticketPrice,
            status: 'COMPLETED',
            description: `Ticket for ${raffle.item.name} (${paymentMethod})`,
        });

        res.status(201).json({
            success: true,
            message: 'Ticket purchased successfully!',
            data: ticket,
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
