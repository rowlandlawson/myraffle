import { Router } from 'express';
import {
    getWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
} from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin role
router.get('/withdrawals', requireAuth, requireAdmin, getWithdrawals);
router.put('/withdrawals/:id/approve', requireAuth, requireAdmin, approveWithdrawal);
router.put('/withdrawals/:id/reject', requireAuth, requireAdmin, rejectWithdrawal);

export default router;
