import { Router } from 'express';
import {
    getUserTickets,
    getTicketById,
    buyTicket,
    getTicketHistory,
} from '../controllers/ticketController';
import { requireAuth } from '../middleware/auth';
import { validate, buyTicketSchema } from '../middleware/validation';

const router = Router();

// All ticket routes require authentication
router.get('/history', requireAuth, getTicketHistory);
router.get('/', requireAuth, getUserTickets);
router.get('/:id', requireAuth, getTicketById);
router.post('/', requireAuth, validate(buyTicketSchema), buyTicket);

export default router;
