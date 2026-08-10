import { Router } from 'express';
import { getSetting } from '../controllers/settingsController';

const router = Router();

// GET /api/settings/:key — Public
router.get('/:key', getSetting);

export default router;
