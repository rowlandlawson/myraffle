import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { validateEnv, env } from './config/environment';
import { prisma } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
// Visitor tracking is handled client-side via /api/track-visit (see below)
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import walletRoutes from './routes/wallet';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import itemRoutes from './routes/items';
import raffleRoutes from './routes/raffles';
import ticketRoutes from './routes/tickets';
import taskRoutes from './routes/tasks';
import webhookRoutes from './routes/webhooks';
import bannerRoutes from './routes/banners';
import settingsRoutes from './routes/settings';
import { startCronService } from './services/cronService';

// Load env vars
dotenv.config();

// Validate required env vars
try {
    validateEnv();
} catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Visitor tracking is done client-side via POST /api/track-visit below

// Global rate limiter for all API routes
app.use('/api', generalLimiter);

// Health Check
app.get('/api/health', async (req, res) => {
    let dbHealthy = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbHealthy = true;
    } catch {
        dbHealthy = false;
    }

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    let uptimeText = 'Online';
    if (hours > 0) uptimeText = `${hours}h ${minutes}m`;
    else if (minutes > 0) uptimeText = `${minutes}m ${seconds}s`;
    else uptimeText = `${seconds}s`;

    const hasPaystack = !!process.env.PAYSTACK_SECRET_KEY;
    const hasMonnify = !!process.env.MONNIFY_API_KEY;
    const paymentText = hasPaystack ? '✓ Paystack' : hasMonnify ? '✓ Monnify' : '✓ Connected';

    const hasBrevo = !!process.env.BREVO_API_KEY;
    const emailText = hasBrevo ? '✓ Brevo Active' : '✓ Active';

    res.status(200).json({
        status: 'ok',
        uptime: uptimeText,
        services: [
            { label: 'Server Uptime', value: uptimeText, status: 'healthy' },
            { label: 'Database Status', value: dbHealthy ? '✓ Connected' : '✗ Disconnected', status: dbHealthy ? 'healthy' : 'error' },
            { label: 'Payment Gateway', value: paymentText, status: 'healthy' },
            { label: 'Email Service', value: emailText, status: 'healthy' },
        ],
    });
});

// Client-side visitor tracking — records page visits from the Next.js frontend
// Uses IP+path dedup (5-min window) so the same visitor isn't counted twice
const trackVisitDedup = new Map<string, number>();
const TRACK_DEDUP_MS = 5 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    for (const [key, ts] of trackVisitDedup.entries()) {
        if (now - ts > TRACK_DEDUP_MS) trackVisitDedup.delete(key);
    }
}, 10 * 60 * 1000);

app.post('/api/track-visit', (req, res) => {
    const { path } = req.body;
    // Accept any non-API page path (/, /items, /items/123, /dashboard, /dashboard/earnings, etc.)
    if (!path || typeof path !== 'string' || path.startsWith('/api')) {
        res.status(200).json({ success: true }); // Silently ignore invalid paths
        return;
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    const dedupKey = `${ip}:${path}`;

    if (trackVisitDedup.has(dedupKey)) {
        res.status(200).json({ success: true });
        return;
    }

    trackVisitDedup.set(dedupKey, Date.now());

    // Record asynchronously — don't block the response
    prisma.pageVisit.create({
        data: {
            path,
            ip,
            userAgent: req.headers['user-agent'] || null,
        },
    }).catch(err => {
        console.error('[Visitor] Failed to record visit:', err.message);
    });

    res.status(200).json({ success: true });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);

// Real-Time SSE Endpoint for Live Ticket Counters
app.get('/api/events/raffles', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const interval = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'PING', timestamp: Date.now() })}\n\n`);
    }, 20000);

    req.on('close', () => {
        clearInterval(interval);
    });
});

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
  🚀 Server is running!
  listening on port ${PORT}
  Frontend URL: ${env.FRONTEND_URL}
  Environment: ${env.NODE_ENV}
  `);
    startCronService();
});
