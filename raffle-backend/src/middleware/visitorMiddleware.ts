import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

// Track only specific public-facing routes
const TRACKED_PATHS = ['/', '/items', '/dashboard'];

// Simple in-memory dedup: track IP+path combos within a 5-minute window
const recentVisits = new Map<string, number>();
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// Cleanup stale entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of recentVisits.entries()) {
        if (now - timestamp > DEDUP_WINDOW_MS) {
            recentVisits.delete(key);
        }
    }
}, 10 * 60 * 1000);

export const visitorTracking = (req: Request, _res: Response, next: NextFunction) => {
    // Only track GET requests to specific paths
    if (req.method !== 'GET') {
        return next();
    }

    // Normalize path — match tracked paths
    const path = req.path.replace(/\/$/, '') || '/';
    const isTracked = TRACKED_PATHS.some(tracked => {
        if (tracked === '/') return path === '/';
        return path === tracked || path.startsWith(tracked + '/');
    });

    if (!isTracked) {
        return next();
    }

    // Dedup by IP + path
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    const dedupKey = `${ip}:${path}`;

    if (recentVisits.has(dedupKey)) {
        return next();
    }

    // Record visit asynchronously (don't block the request)
    recentVisits.set(dedupKey, Date.now());

    prisma.pageVisit.create({
        data: {
            path,
            ip,
            userAgent: req.headers['user-agent'] || null,
        },
    }).catch(err => {
        console.error('[Visitor] Failed to record visit:', err.message);
    });

    next();
};
