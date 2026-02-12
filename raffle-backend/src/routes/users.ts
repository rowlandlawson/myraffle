import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    getUserStatistics,
    suspendUser,
    activateUser,
} from '../controllers/userController';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate, updateProfileSchema } from '../middleware/validation';

const router = Router();

// Protected routes (authenticated users)
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfile);
router.get('/statistics', requireAuth, getUserStatistics);

// Admin-only routes
router.put('/suspend', requireAuth, requireAdmin, suspendUser);
router.put('/activate', requireAuth, requireAdmin, activateUser);

export default router;
