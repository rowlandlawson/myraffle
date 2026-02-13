import { Request, Response } from 'express';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { POINTS_VALUE_RATE } from '../config/constants';

// GET /api/tickets — Get user's tickets (paginated)
export const getUserTickets = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where: Record<string, unknown> = { userId };
        if (status) where.status = status;

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
                        },
                    },
                },
            }),
            prisma.ticket.count({ where }),
        ]);

        res.json({
            success: true,
            message: 'Tickets retrieved successfully',
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
        console.error('Get tickets error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve tickets' });
    }
};

// GET /api/tickets/:id — Get ticket details
export const getTicketById = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params as { id: string };

        const ticket = await prisma.ticket.findFirst({
            where: { id, userId },
            include: {
                raffle: {
                    include: {
                        item: true,
                        winner: {
                            select: { id: true, name: true, userNumber: true },
                        },
                    },
                },
            },
        });

        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }

        res.json({ success: true, message: 'Ticket retrieved', data: ticket });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve ticket' });
    }
};

// POST /api/tickets — Buy a ticket
export const buyTicket = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { raffleId, paymentMethod } = req.body; // paymentMethod: 'wallet' | 'points'

        // 1. Get raffle details
        const raffle = await prisma.raffle.findUnique({
            where: { id: raffleId },
            include: { item: true },
        });

        if (!raffle) {
            res.status(404).json({ success: false, message: 'Raffle not found' });
            return;
        }

        if (raffle.status !== 'ACTIVE') {
            res.status(400).json({
                success: false,
                message: 'This raffle is not currently active',
            });
            return;
        }

        if (raffle.ticketsSold >= raffle.ticketsTotal) {
            res.status(400).json({
                success: false,
                message: 'All tickets for this raffle have been sold',
            });
            return;
        }

        // 2. Check 1-per-user-per-raffle limit
        const existingTicket = await prisma.ticket.findFirst({
            where: { userId, raffleId },
        });

        if (existingTicket) {
            res.status(400).json({
                success: false,
                message: 'You already have a ticket for this raffle (limit: 1 per user)',
            });
            return;
        }

        // 3. Get user and check balance
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const ticketPrice = raffle.ticketPrice;

        if (paymentMethod === 'points') {
            // Convert points to naira: POINTS_VALUE_RATE points = ₦1
            const pointsNeeded = Math.ceil(ticketPrice * POINTS_VALUE_RATE);
            if (user.rafflePoints < pointsNeeded) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient raffle points. You need ${pointsNeeded} points (you have ${user.rafflePoints})`,
                });
                return;
            }
        } else {
            // wallet payment
            if (user.walletBalance < ticketPrice) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient wallet balance. Ticket costs ₦${ticketPrice.toLocaleString()} (you have ₦${user.walletBalance.toLocaleString()})`,
                });
                return;
            }
        }

        // 4. Generate unique ticket number
        const ticketNumber = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // 5. Atomic transaction: deduct balance/points, create ticket, increment ticketsSold
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Deduct payment
            if (paymentMethod === 'points') {
                const pointsNeeded = Math.ceil(ticketPrice * POINTS_VALUE_RATE);
                await tx.user.update({
                    where: { id: userId },
                    data: { rafflePoints: { decrement: pointsNeeded } },
                });
            } else {
                await tx.user.update({
                    where: { id: userId },
                    data: { walletBalance: { decrement: ticketPrice } },
                });
            }

            // Create ticket
            const ticket = await tx.ticket.create({
                data: {
                    userId,
                    raffleId,
                    ticketNumber,
                    status: 'ACTIVE',
                },
            });

            // Increment ticketsSold
            await tx.raffle.update({
                where: { id: raffleId },
                data: { ticketsSold: { increment: 1 } },
            });

            // Log transaction
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'TICKET_PURCHASE',
                    amount: ticketPrice,
                    status: 'COMPLETED',
                    description: `Ticket for ${raffle.item.name} (${paymentMethod === 'points' ? 'points' : 'wallet'})`,
                },
            });

            return ticket;
        });

        res.status(201).json({
            success: true,
            message: 'Ticket purchased successfully!',
            data: {
                ticket: result,
                itemName: raffle.item.name,
                raffleDate: raffle.raffleDate,
                paymentMethod,
            },
        });
    } catch (error) {
        console.error('Buy ticket error:', error);
        res.status(500).json({ success: false, message: 'Failed to purchase ticket' });
    }
};

// GET /api/tickets/history — Full ticket history with raffle/item info
export const getTicketHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const tickets = await prisma.ticket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
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
                        winner: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        const stats = {
            total: tickets.length,
            active: tickets.filter((t) => t.status === 'ACTIVE').length,
            won: tickets.filter((t) => t.status === 'WON').length,
            lost: tickets.filter((t) => t.status === 'LOST').length,
        };

        res.json({
            success: true,
            message: 'Ticket history retrieved',
            data: { tickets, stats },
        });
    } catch (error) {
        console.error('Get ticket history error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve ticket history' });
    }
};
