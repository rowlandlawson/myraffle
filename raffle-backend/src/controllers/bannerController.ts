import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { uploadToCloudinary } from '../services/cloudinary';

// GET /api/banners — Public, active banners sorted by priority
export const getPublicBanners = async (req: Request, res: Response) => {
    try {
        const banners = await (prisma as any).banner.findMany({
            where: { isActive: true },
            orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });

        res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        console.error('[Banners] Get public banners error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
    }
};

// GET /api/admin/banners — Admin only, all banners
export const getAdminBanners = async (req: Request, res: Response) => {
    try {
        const banners = await (prisma as any).banner.findMany({
            orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });

        res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        console.error('[Banners] Get admin banners error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin banners.' });
    }
};

// POST /api/admin/banners — Admin only, create banner with optional image upload
export const createBanner = async (req: Request, res: Response) => {
    try {
        const { title, subtitle, linkUrl, buttonText, priority, isActive } = req.body;

        let imageUrl = req.body.imageUrl || '';

        if (req.file) {
            const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET;

            if (hasCloudinary) {
                imageUrl = await uploadToCloudinary(req.file.buffer, 'banners');
            } else {
                const fs = await import('fs/promises');
                const path = await import('path');
                const crypto = await import('crypto');

                const uploadsDir = path.join(process.cwd(), 'uploads', 'banners');
                await fs.mkdir(uploadsDir, { recursive: true });

                const ext = req.file.originalname.split('.').pop() || 'jpg';
                const filename = `${crypto.randomUUID()}.${ext}`;
                const filepath = path.join(uploadsDir, filename);

                await fs.writeFile(filepath, req.file.buffer);
                imageUrl = `/uploads/banners/${filename}`;
            }
        }

        if (!imageUrl && !req.body.imageUrl) {
            res.status(400).json({ success: false, message: 'Banner image is required.' });
            return;
        }

        const banner = await (prisma as any).banner.create({
            data: {
                title: title || 'Promotional Banner',
                subtitle: subtitle || null,
                imageUrl: imageUrl || req.body.imageUrl,
                linkUrl: linkUrl || null,
                buttonText: buttonText || null,
                priority: priority ? parseInt(priority, 10) : 0,
                isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Banner created successfully.',
            data: banner,
        });
    } catch (error) {
        console.error('[Banners] Create banner error:', error);
        res.status(500).json({ success: false, message: 'Failed to create banner.' });
    }
};

// PUT /api/admin/banners/:id — Admin only, update banner
export const updateBanner = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);
        const { title, subtitle, linkUrl, buttonText, priority, isActive } = req.body;

        const existing = await (prisma as any).banner.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Banner not found.' });
            return;
        }

        let imageUrl = existing.imageUrl;
        if (req.file) {
            const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET;

            if (hasCloudinary) {
                imageUrl = await uploadToCloudinary(req.file.buffer, 'banners');
            } else {
                const fs = await import('fs/promises');
                const path = await import('path');
                const crypto = await import('crypto');

                const uploadsDir = path.join(process.cwd(), 'uploads', 'banners');
                await fs.mkdir(uploadsDir, { recursive: true });

                const ext = req.file.originalname.split('.').pop() || 'jpg';
                const filename = `${crypto.randomUUID()}.${ext}`;
                const filepath = path.join(uploadsDir, filename);

                await fs.writeFile(filepath, req.file.buffer);
                imageUrl = `/uploads/banners/${filename}`;
            }
        } else if (req.body.imageUrl) {
            imageUrl = req.body.imageUrl;
        }

        const banner = await (prisma as any).banner.update({
            where: { id },
            data: {
                title: title !== undefined ? title : existing.title,
                subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
                imageUrl,
                linkUrl: linkUrl !== undefined ? linkUrl : existing.linkUrl,
                buttonText: buttonText !== undefined ? buttonText : existing.buttonText,
                priority: priority !== undefined ? parseInt(priority, 10) : existing.priority,
                isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.isActive,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Banner updated successfully.',
            data: banner,
        });
    } catch (error) {
        console.error('[Banners] Update banner error:', error);
        res.status(500).json({ success: false, message: 'Failed to update banner.' });
    }
};

// DELETE /api/admin/banners/:id — Admin only, delete banner
export const deleteBanner = async (req: Request, res: Response) => {
    try {
        const id: string = String(req.params.id);

        await (prisma as any).banner.delete({ where: { id } });

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully.',
        });
    } catch (error) {
        console.error('[Banners] Delete banner error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete banner.' });
    }
};
