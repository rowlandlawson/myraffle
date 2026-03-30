import { Router } from 'express';
import { handleAdCompleted } from '../controllers/webhookController';

const router = Router();

// POST /api/webhooks/ad-completed — S2S callback from ad network
router.post('/ad-completed', handleAdCompleted);

// GET version (some ad networks use GET for postbacks)
router.get('/ad-completed', handleAdCompleted);

export default router;
