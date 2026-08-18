import { Router } from 'express';
import {
  createRaffle,
  createRaffleWithItem,
  getAllRaffles,
  getMyWins,
  getRaffleById,
  getRaffleWinner,
  startRaffleDraw,
  updateRaffle,
} from '../controllers/raffleController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { createRaffleSchema, updateRaffleSchema, validate } from '../middleware/validation';

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
