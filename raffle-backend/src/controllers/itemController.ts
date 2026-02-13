import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/items — Get all items (public, paginated, filterable)
export const getAllItems = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;
        const category = req.query.category as string | undefined;
        const status = req.query.status as string | undefined;
        const search = req.query.search as string | undefined;

        const where: Record<string, unknown> = {};

        if (category) where.category = category;
        if (status) {
            where.status = status;
        } else {
            // By default, only show ACTIVE items to public
            where.status = 'ACTIVE';
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            prisma.item.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    raffles: {
                        where: { status: { in: ['SCHEDULED', 'ACTIVE'] } },
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
            }),
            prisma.item.count({ where }),
        ]);

        res.json({
            success: true,
            message: 'Items retrieved successfully',
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
        console.error('Get items error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve items' });
    }
};

// GET /api/items/:id — Get item details (public)
export const getItemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                raffles: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: { select: { tickets: true } },
                    },
                },
            },
        });

        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }

        res.json({ success: true, message: 'Item retrieved', data: item });
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve item' });
    }
};

// POST /api/items — Admin: create item with image upload
export const createItem = async (req: Request, res: Response) => {
    try {
        const { name, description, value, category } = req.body;

        if (!req.file) {
            res.status(400).json({ success: false, message: 'Image file is required' });
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
                status: 'DRAFT',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: item,
        });
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ success: false, message: 'Failed to create item' });
    }
};

// PUT /api/items/:id — Admin: update item
export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { name, description, value, category, status } = req.body;

        const existing = await prisma.item.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (value !== undefined) updateData.value = parseFloat(value);
        if (category !== undefined) updateData.category = category;
        if (status !== undefined) updateData.status = status;

        // If new image uploaded, update imageUrl
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const item = await prisma.item.update({
            where: { id },
            data: updateData,
        });

        res.json({ success: true, message: 'Item updated successfully', data: item });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ success: false, message: 'Failed to update item' });
    }
};

// DELETE /api/items/:id — Admin: delete item
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                raffles: {
                    where: { status: { in: ['SCHEDULED', 'ACTIVE'] } },
                },
            },
        });

        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }

        if (item.raffles.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete item with active or scheduled raffles',
            });
            return;
        }

        await prisma.item.delete({ where: { id } });

        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete item' });
    }
};
