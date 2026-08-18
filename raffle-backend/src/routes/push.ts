import { Router } from 'express';
import {
  getVapidPublicKey,
  subscribe,
  testPushNotification,
  unsubscribe,
} from '../controllers/pushController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public VAPID public key
router.get('/vapid-public-key', getVapidPublicKey);

// Authenticated push endpoints
router.post('/subscribe', requireAuth, subscribe);
router.delete('/unsubscribe', requireAuth, unsubscribe);
router.post('/test', requireAuth, testPushNotification);

export default router;
