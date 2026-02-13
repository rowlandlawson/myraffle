import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { validateEnv, env } from './config/environment';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import walletRoutes from './routes/wallet';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import itemRoutes from './routes/items';
import raffleRoutes from './routes/raffles';
import ticketRoutes from './routes/tickets';

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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'RaffleHub Backend is running' });
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
});

