import { Router } from 'express';
import {
  buyTicket,
  getTicketById,
  getTicketHistory,
  getUserTickets,
} from '../controllers/ticketController';
import { requireAuth } from '../middleware/auth';
import { ticketPurchaseLimiter } from '../middleware/rateLimiter';
import { buyTicketSchema, validate } from '../middleware/validation';

const router = Router();

// All ticket routes require authentication
router.get('/history', requireAuth, getTicketHistory);
router.get('/', requireAuth, getUserTickets);
router.get('/:id', requireAuth, getTicketById);
router.post('/', requireAuth, ticketPurchaseLimiter, validate(buyTicketSchema), buyTicket);

export default router;
