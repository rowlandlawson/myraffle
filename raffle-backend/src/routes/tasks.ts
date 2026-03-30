import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
    getAvailableTasks,
    getTaskById,
    completeTask,
    getCompletedTasks,
} from '../controllers/taskController';

const router = Router();

// Tasks list: optionalAuth so logged-in users get a curated drip-feed
router.get('/', optionalAuth, getAvailableTasks);
router.get('/completed', requireAuth, getCompletedTasks);
router.get('/:id', getTaskById);

// Protected routes
router.post('/:id/complete', requireAuth, completeTask);

export default router;
