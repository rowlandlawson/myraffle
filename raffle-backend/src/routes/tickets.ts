import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate, buyTicketSchema } from '../middleware/validation';
import {
    getUserTickets,
    getTicketById,
    buyTicket,
    getTicketHistory,
} from '../controllers/ticketController';

const router = Router();

// All ticket routes require authentication
router.get('/', requireAuth, getUserTickets);
router.get('/history', requireAuth, getTicketHistory);
router.get('/:id', requireAuth, getTicketById);
router.post('/', requireAuth, validate(buyTicketSchema), buyTicket);

export default router;
