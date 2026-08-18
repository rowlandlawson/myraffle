import { Router } from 'express';
import {
  approveWithdrawal,
  convertPrizeToWallet,
  createTask,
  deleteTask,
  extendRaffleTimer,
  getAdminWins,
  getAllAdminTasks,
  getAllTransactions,
  getAllUsers,
  getAnalytics,
  getDashboardStats,
  getVisitorAnalytics,
  getWithdrawals,
  rejectWithdrawal,
  sendAnnouncement,
  updateDeliveryStatus,
  updateTask,
} from '../controllers/adminController';
import {
  createBanner,
  deleteBanner,
  getAdminBanners,
  updateBanner,
} from '../controllers/bannerController';
import {
  getBonusSettings,
  updateBonusSettings,
  updateSetting,
} from '../controllers/settingsController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

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
router.post('/wins/:raffleId/convert-wallet', requireAuth, requireAdmin, convertPrizeToWallet);

// Raffle timer extension
router.post('/raffles/:id/extend', requireAuth, requireAdmin, extendRaffleTimer);

// Banner management
router.get('/banners', requireAuth, requireAdmin, getAdminBanners);
router.post('/banners', requireAuth, requireAdmin, upload.single('image'), createBanner);
router.put('/banners/:id', requireAuth, requireAdmin, upload.single('image'), updateBanner);
router.delete('/banners/:id', requireAuth, requireAdmin, deleteBanner);

// Settings management (e.g. Terms & Conditions and Bonus Settings)
router.get('/bonus-settings', requireAuth, requireAdmin, getBonusSettings);
router.put('/bonus-settings', requireAuth, requireAdmin, updateBonusSettings);
router.put('/settings/:key', requireAuth, requireAdmin, updateSetting);

// Broadcast Announcement push notifications
router.post('/announcements', requireAuth, requireAdmin, sendAnnouncement);

export default router;
