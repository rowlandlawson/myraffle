import { Router } from 'express';
import {
    getBalance,
    initiateDeposit,
    requestWithdrawal,
    getTransactions,
} from '../controllers/walletController';
import { requireAuth } from '../middleware/auth';
import { validate, depositSchema, withdrawalSchema } from '../middleware/validation';

const router = Router();

// All wallet routes require authentication
router.get('/balance', requireAuth, getBalance);
router.post('/deposit', requireAuth, validate(depositSchema), initiateDeposit);
router.post('/withdraw', requireAuth, validate(withdrawalSchema), requestWithdrawal);
router.get('/transactions', requireAuth, getTransactions);

export default router;
