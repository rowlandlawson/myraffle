import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt';

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token!);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
        return;
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
        return;
    }
    next();
};
