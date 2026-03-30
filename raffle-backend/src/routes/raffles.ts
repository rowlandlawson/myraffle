import { Router } from 'express';
import {
    getAllRaffles,
    getRaffleById,
    createRaffle,
    updateRaffle,
    startRaffleDraw,
    getRaffleWinner,
    getMyWins,
    createRaffleWithItem,
} from '../controllers/raffleController';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate, createRaffleSchema, updateRaffleSchema } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getAllRaffles);

// Authenticated user routes (before :id to avoid route conflicts)
router.get('/my-wins', requireAuth, getMyWins);

router.get('/:id', getRaffleById);
router.get('/:id/winners', getRaffleWinner);

// Admin routes
router.post('/create', requireAuth, requireAdmin, upload.single('image'), createRaffleWithItem);
router.post('/', requireAuth, requireAdmin, validate(createRaffleSchema), createRaffle);
router.put('/:id', requireAuth, requireAdmin, validate(updateRaffleSchema), updateRaffle);
router.post('/:id/start', requireAuth, requireAdmin, startRaffleDraw);

export default router;
