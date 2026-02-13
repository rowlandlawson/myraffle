import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { runRaffle } from '../services/raffle';

// GET /api/raffles — Get all raffles (public, paginated)
export const getAllRaffles = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where: Record<string, unknown> = {};
        if (status) where.status = status;

        const [raffles, total] = await Promise.all([
            prisma.raffle.findMany({
                where,
                skip,
                take: limit,
                orderBy: { raffleDate: 'asc' },
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
                    _count: { select: { tickets: true } },
                },
            }),
            prisma.raffle.count({ where }),
        ]);

        res.json({
            success: true,
            message: 'Raffles retrieved successfully',
            data: {
                raffles,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get raffles error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve raffles' });
    }
};

// GET /api/raffles/:id — Get raffle details (public)
export const getRaffleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const raffle = await prisma.raffle.findUnique({
            where: { id },
            include: {
                item: true,
                _count: { select: { tickets: true } },
                winner: {
                    select: { id: true, name: true, userNumber: true },
                },
            },
        });

        if (!raffle) {
            res.status(404).json({ success: false, message: 'Raffle not found' });
            return;
        }

        res.json({ success: true, message: 'Raffle retrieved', data: raffle });
    } catch (error) {
        console.error('Get raffle error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve raffle' });
    }
};

// POST /api/raffles — Admin: create raffle
export const createRaffle = async (req: Request, res: Response) => {
    try {
        const { itemId, ticketPrice, ticketsTotal, raffleDate } = req.body;

        // Validate item exists and is ACTIVE
        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }

        // Check no active raffle already exists for this item
        const existingRaffle = await prisma.raffle.findFirst({
            where: {
                itemId,
                status: { in: ['SCHEDULED', 'ACTIVE'] },
            },
        });
        if (existingRaffle) {
            res.status(400).json({
                success: false,
                message: 'An active or scheduled raffle already exists for this item',
            });
            return;
        }

        // Set item to ACTIVE when raffle is created
        const raffle = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.item.update({
                where: { id: itemId },
                data: { status: 'ACTIVE' },
            });

            return tx.raffle.create({
                data: {
                    itemId,
                    ticketPrice: parseFloat(ticketPrice),
                    ticketsTotal: parseInt(ticketsTotal),
                    raffleDate: new Date(raffleDate),
                    status: 'ACTIVE',
                },
                include: { item: true },
            });
        });

        res.status(201).json({
            success: true,
            message: 'Raffle created successfully',
            data: raffle,
        });
    } catch (error) {
        console.error('Create raffle error:', error);
        res.status(500).json({ success: false, message: 'Failed to create raffle' });
    }
};

// PUT /api/raffles/:id — Admin: update raffle (only if SCHEDULED or ACTIVE)
export const updateRaffle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { ticketPrice, ticketsTotal, raffleDate, status } = req.body;

        const existing = await prisma.raffle.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Raffle not found' });
            return;
        }

        if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
            res.status(400).json({
                success: false,
                message: `Cannot update a ${existing.status.toLowerCase()} raffle`,
            });
            return;
        }

        const updateData: Record<string, unknown> = {};
        if (ticketPrice !== undefined) updateData.ticketPrice = parseFloat(ticketPrice);
        if (ticketsTotal !== undefined) updateData.ticketsTotal = parseInt(ticketsTotal);
        if (raffleDate !== undefined) updateData.raffleDate = new Date(raffleDate);
        if (status !== undefined) updateData.status = status;

        const raffle = await prisma.raffle.update({
            where: { id },
            data: updateData,
            include: { item: true },
        });

        res.json({ success: true, message: 'Raffle updated successfully', data: raffle });
    } catch (error) {
        console.error('Update raffle error:', error);
        res.status(500).json({ success: false, message: 'Failed to update raffle' });
    }
};

// POST /api/raffles/:id/start — Admin: trigger raffle draw
export const startRaffle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const result = await runRaffle(id);

        res.json({
            success: true,
            message: `Raffle drawn! Winner selected from ${result.totalTickets} tickets.`,
            data: result,
        });
    } catch (error: any) {
        console.error('Start raffle error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to run raffle',
        });
    }
};

// GET /api/raffles/:id/winners — Get raffle winner (public)
export const getRaffleWinner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const raffle = await prisma.raffle.findUnique({
            where: { id },
            include: {
                item: {
                    select: { id: true, name: true, imageUrl: true, value: true },
                },
                winner: {
                    select: { id: true, name: true, userNumber: true },
                },
                tickets: {
                    where: { status: 'WON' },
                    select: { ticketNumber: true },
                },
            },
        });

        if (!raffle) {
            res.status(404).json({ success: false, message: 'Raffle not found' });
            return;
        }

        if (raffle.status !== 'COMPLETED' || !raffle.winner) {
            res.status(400).json({
                success: false,
                message: 'Raffle has not been drawn yet',
            });
            return;
        }

        res.json({
            success: true,
            message: 'Raffle winner retrieved',
            data: {
                raffle: {
                    id: raffle.id,
                    raffleDate: raffle.raffleDate,
                    ticketsSold: raffle.ticketsSold,
                },
                item: raffle.item,
                winner: raffle.winner,
                winningTicketNumber: raffle.tickets[0]?.ticketNumber || null,
            },
        });
    } catch (error) {
        console.error('Get winner error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve winner' });
    }
};
