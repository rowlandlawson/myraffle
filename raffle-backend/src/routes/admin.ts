import { Router } from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getAllTransactions,
    getAnalytics,
    getWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    getAllAdminTasks,
    createTask,
    updateTask,
    deleteTask,
    getVisitorAnalytics,
    getAdminWins,
    updateDeliveryStatus,
} from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin role
router.get('/dashboard', requireAuth, requireAdmin, getDashboardStats);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/transactions', requireAuth, requireAdmin, getAllTransactions);
router.get('/analytics', requireAuth, requireAdmin, getAnalytics);
router.get('/analytics/visitors', requireAuth, requireAdmin, getVisitorAnalytics);
router.get('/withdrawals', requireAuth, requireAdmin, getWithdrawals);
router.put('/withdrawals/:id/approve', requireAuth, requireAdmin, approveWithdrawal);
router.put('/withdrawals/:id/reject', requireAuth, requireAdmin, rejectWithdrawal);

// Task management
router.get('/tasks', requireAuth, requireAdmin, getAllAdminTasks);
router.post('/tasks', requireAuth, requireAdmin, createTask);
router.put('/tasks/:id', requireAuth, requireAdmin, updateTask);
router.delete('/tasks/:id', requireAuth, requireAdmin, deleteTask);

// Wins management
router.get('/wins', requireAuth, requireAdmin, getAdminWins);
router.put('/wins/:raffleId/delivery', requireAuth, requireAdmin, updateDeliveryStatus);

export default router;
