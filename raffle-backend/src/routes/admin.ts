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
    convertPrizeToWallet,
} from '../controllers/adminController';
import {
    getAdminBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} from '../controllers/bannerController';
import { updateSetting } from '../controllers/settingsController';
import { upload } from '../middleware/upload';
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

// Banner management
router.get('/banners', requireAuth, requireAdmin, getAdminBanners);
router.post('/banners', requireAuth, requireAdmin, upload.single('image'), createBanner);
router.put('/banners/:id', requireAuth, requireAdmin, upload.single('image'), updateBanner);
router.delete('/banners/:id', requireAuth, requireAdmin, deleteBanner);

// Settings management (e.g. Terms & Conditions)
router.put('/settings/:key', requireAuth, requireAdmin, updateSetting);

export default router;
