import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { runRaffleDraw } from '../services/raffle';

// GET /api/raffles — Public, paginated, filterable by status
export const getAllRaffles = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where: any = {};
        if (status) where.status = status;

        const [raffles, total] = await Promise.all([
            prisma.raffle.findMany({
                where,
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
                            userNumber: true,
                        },
                    },
                    _count: {
                        select: { tickets: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.raffle.count({ where }),
        ]);

        res.status(200).json({
            success: true,
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
        console.error('[Raffles] Get all raffles error:', error);
        res.status(500).json({ success: false, message: 'Failed to get raffles.' });
    }
};

// GET /api/raffles/:id — Public
export const getRaffleById = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);

        const raffle = await prisma.raffle.findUnique({
            where: { id },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        imageUrl: true,
                        value: true,
                        category: true,
                    },
                },
                winner: {
                    select: {
                        id: true,
                        name: true,
                        userNumber: true,
                    },
                },
                _count: {
                    select: { tickets: true },
                },
            },
        });

        if (!raffle) {
            res.status(404).json({ success: false, message: 'Raffle not found.' });
            return;
        }

        res.status(200).json({ success: true, data: raffle });
    } catch (error) {
        console.error('[Raffles] Get raffle error:', error);
        res.status(500).json({ success: false, message: 'Failed to get raffle.' });
    }
};

// POST /api/raffles — Admin only
export const createRaffle = async (req: Request, res: Response) => {
    try {
        const { itemId, ticketPrice, ticketsTotal, raffleDate } = req.body;

        // Check item exists and is active
        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found.' });
            return;
        }

        if (item.status !== 'ACTIVE') {
            res.status(400).json({
                success: false,
                message: 'Item must be active to create a raffle.',
            });
            return;
        }

        // Check no existing active/scheduled raffle for this item
        const existingRaffle = await prisma.raffle.findFirst({
            where: {
                itemId,
                status: { in: ['SCHEDULED', 'ACTIVE'] },
            },
        });

        if (existingRaffle) {
            res.status(400).json({
                success: false,
                message: 'An active or scheduled raffle already exists for this item.',
            });
            return;
        }

        const raffle = await prisma.raffle.create({
            data: {
                itemId,
                ticketPrice,
                ticketsTotal,
                raffleDate: new Date(raffleDate),
                status: 'SCHEDULED',
            },
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
        });

        res.status(201).json({
            success: true,
            message: 'Raffle created successfully.',
            data: raffle,
        });
    } catch (error) {
        console.error('[Raffles] Create raffle error:', error);
        res.status(500).json({ success: false, message: 'Failed to create raffle.' });
    }
};

// PUT /api/raffles/:id — Admin only
export const updateRaffle = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);
        const { ticketPrice, ticketsTotal, raffleDate, status } = req.body;

        const existing = await prisma.raffle.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Raffle not found.' });
            return;
        }

        if (existing.status === 'COMPLETED') {
            res.status(400).json({
                success: false,
                message: 'Cannot update a completed raffle.',
            });
            return;
        }

        const updateData: any = {};
        if (ticketPrice !== undefined) updateData.ticketPrice = ticketPrice;
        if (ticketsTotal !== undefined) updateData.ticketsTotal = ticketsTotal;
        if (raffleDate) updateData.raffleDate = new Date(raffleDate);
        if (status) updateData.status = status;

        const raffle = await prisma.raffle.update({
            where: { id },
            data: updateData,
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
        });

        res.status(200).json({
            success: true,
            message: 'Raffle updated successfully.',
            data: raffle,
        });
    } catch (error) {
        console.error('[Raffles] Update raffle error:', error);
        res.status(500).json({ success: false, message: 'Failed to update raffle.' });
    }
};

// POST /api/raffles/:id/start — Admin only, trigger raffle draw
export const startRaffleDraw = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);

        const result = await runRaffleDraw(id);

        res.status(200).json({
            success: true,
            message: `Raffle draw complete! Winner: ${result.winnerName} (${result.winnerUserNumber})`,
            data: result,
        });
    } catch (error: any) {
        console.error('[Raffles] Start draw error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to start raffle draw.',
        });
    }
};

// GET /api/raffles/:id/winners — Public
export const getRaffleWinner = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);

        const raffle = await prisma.raffle.findUnique({
            where: { id },
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
                    select: {
                        id: true,
                        name: true,
                        userNumber: true,
                    },
                },
            },
        });

        if (!raffle) {
            res.status(404).json({ success: false, message: 'Raffle not found.' });
            return;
        }

        if (raffle.status !== 'COMPLETED' || !raffle.winner) {
            res.status(400).json({
                success: false,
                message: 'Raffle has not been completed yet.',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                raffleId: raffle.id,
                item: raffle.item,
                winner: raffle.winner,
            },
        });
    } catch (error) {
        console.error('[Raffles] Get winner error:', error);
        res.status(500).json({ success: false, message: 'Failed to get raffle winner.' });
    }
};
