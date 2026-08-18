import { Router } from 'express';
import {
  activateUser,
  changePassword,
  getProfile,
  getUserStatistics,
  suspendUser,
  updateProfile,
} from '../controllers/userController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { updateProfileSchema, validate } from '../middleware/validation';

const router = Router();

// Protected routes (authenticated users)
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfile);
router.put('/change-password', requireAuth, changePassword);
router.get('/statistics', requireAuth, getUserStatistics);

// Admin-only routes
router.put('/suspend', requireAuth, requireAdmin, suspendUser);
router.put('/activate', requireAuth, requireAdmin, activateUser);

export default router;
