import { Router } from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getAllTransactions,
    getAnalytics,
    getWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
} from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin role
router.get('/dashboard', requireAuth, requireAdmin, getDashboardStats);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/transactions', requireAuth, requireAdmin, getAllTransactions);
router.get('/analytics', requireAuth, requireAdmin, getAnalytics);
router.get('/withdrawals', requireAuth, requireAdmin, getWithdrawals);
router.put('/withdrawals/:id/approve', requireAuth, requireAdmin, approveWithdrawal);
router.put('/withdrawals/:id/reject', requireAuth, requireAdmin, rejectWithdrawal);

export default router;
