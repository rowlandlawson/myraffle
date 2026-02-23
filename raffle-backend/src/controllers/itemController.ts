import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/items — Public, paginated, filterable
export const getAllItems = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const category = req.query.category as string | undefined;
        const status = req.query.status as string | undefined;
        const search = req.query.search as string | undefined;

        // Build filter
        const where: any = {};
        if (category) where.category = category;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            prisma.item.findMany({
                where,
                include: {
                    raffles: {
                        select: {
                            id: true,
                            ticketPrice: true,
                            ticketsTotal: true,
                            ticketsSold: true,
                            raffleDate: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.item.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('[Items] Get all items error:', error);
        res.status(500).json({ success: false, message: 'Failed to get items.' });
    }
};

// GET /api/items/:id — Public
export const getItemById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                raffles: {
                    select: {
                        id: true,
                        ticketPrice: true,
                        ticketsTotal: true,
                        ticketsSold: true,
                        raffleDate: true,
                        status: true,
                    },
                },
            },
        });

        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found.' });
            return;
        }

        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error('[Items] Get item error:', error);
        res.status(500).json({ success: false, message: 'Failed to get item.' });
    }
};

// POST /api/items — Admin only
export const createItem = async (req: Request, res: Response) => {
    try {
        const { name, description, value, category } = req.body;

        // Image URL from multer
        if (!req.file) {
            res.status(400).json({ success: false, message: 'Item image is required.' });
            return;
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const item = await prisma.item.create({
            data: {
                name,
                description,
                imageUrl,
                value: parseFloat(value),
                category,
                status: 'ACTIVE',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully.',
            data: item,
        });
    } catch (error) {
        console.error('[Items] Create item error:', error);
        res.status(500).json({ success: false, message: 'Failed to create item.' });
    }
};

// PUT /api/items/:id — Admin only
export const updateItem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, description, value, category, status } = req.body;

        // Check item exists
        const existing = await prisma.item.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Item not found.' });
            return;
        }

        // Build update data
        const updateData: any = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (value) updateData.value = parseFloat(value);
        if (category) updateData.category = category;
        if (status) updateData.status = status;

        // If a new image was uploaded
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const item = await prisma.item.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'Item updated successfully.',
            data: item,
        });
    } catch (error) {
        console.error('[Items] Update item error:', error);
        res.status(500).json({ success: false, message: 'Failed to update item.' });
    }
};

// DELETE /api/items/:id — Admin only
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);

        // Check item exists
        const existing = await prisma.item.findUnique({ where: { id } });

        if (!existing) {
            res.status(404).json({ success: false, message: 'Item not found.' });
            return;
        }

        // Check for active/scheduled raffles separately
        const activeRaffleCount = await prisma.raffle.count({
            where: {
                itemId: id,
                status: { in: ['SCHEDULED', 'ACTIVE'] },
            },
        });

        if (activeRaffleCount > 0) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete item with active or scheduled raffles.',
            });
            return;
        }

        await prisma.item.delete({ where: { id } });

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully.',
        });
    } catch (error) {
        console.error('[Items] Delete item error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete item.' });
    }
};
