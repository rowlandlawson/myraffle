import { Router } from 'express';
import {
    getAllRaffles,
    getRaffleById,
    createRaffle,
    updateRaffle,
    startRaffleDraw,
    getRaffleWinner,
} from '../controllers/raffleController';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate, createRaffleSchema, updateRaffleSchema } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', getAllRaffles);
router.get('/:id', getRaffleById);
router.get('/:id/winners', getRaffleWinner);

// Admin routes
router.post('/', requireAuth, requireAdmin, validate(createRaffleSchema), createRaffle);
router.put('/:id', requireAuth, requireAdmin, validate(updateRaffleSchema), updateRaffle);
router.post('/:id/start', requireAuth, requireAdmin, startRaffleDraw);

export default router;
