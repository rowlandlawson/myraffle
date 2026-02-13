import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate, createRaffleSchema, updateRaffleSchema } from '../middleware/validation';
import {
    getAllRaffles,
    getRaffleById,
    createRaffle,
    updateRaffle,
    startRaffle,
    getRaffleWinner,
} from '../controllers/raffleController';

const router = Router();

// Public routes
router.get('/', getAllRaffles);
router.get('/:id', getRaffleById);
router.get('/:id/winners', getRaffleWinner);

// Admin-only routes
router.post('/', requireAuth, requireAdmin, validate(createRaffleSchema), createRaffle);
router.put('/:id', requireAuth, requireAdmin, validate(updateRaffleSchema), updateRaffle);
router.post('/:id/start', requireAuth, requireAdmin, startRaffle);

export default router;
