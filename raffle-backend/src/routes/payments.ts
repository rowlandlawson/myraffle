import { Router } from 'express';
import {
    initializePayment,
    verifyPayment,
    handleWebhook,
    getPaymentHistory,
} from '../controllers/paymentController';
import { handleMonnifyWebhook } from '../controllers/monnifyController';
import { requireAuth } from '../middleware/auth';
import { validate, depositSchema, verifyPaymentSchema } from '../middleware/validation';

const router = Router();

// Protected routes
router.post('/initialize', requireAuth, validate(depositSchema), initializePayment);
router.post('/verify', requireAuth, validate(verifyPaymentSchema), verifyPayment);
router.get('/history', requireAuth, getPaymentHistory);

// Public route — Paystack webhook
router.post('/webhook', handleWebhook);

// Public route — Monnify webhook
router.post('/monnify-webhook', handleMonnifyWebhook);

export default router;
