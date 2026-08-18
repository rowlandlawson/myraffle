import { Router } from 'express';
import { handleMonnifyWebhook } from '../controllers/monnifyController';
import {
  getPaymentHistory,
  handleWebhook,
  initializePayment,
  verifyPayment,
} from '../controllers/paymentController';
import { requireAuth } from '../middleware/auth';
import { depositSchema, validate, verifyPaymentSchema } from '../middleware/validation';

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
