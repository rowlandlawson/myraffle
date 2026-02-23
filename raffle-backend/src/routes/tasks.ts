import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
    getAvailableTasks,
    getTaskById,
    completeTask,
    getCompletedTasks,
} from '../controllers/taskController';

const router = Router();

// Public routes
router.get('/', getAvailableTasks);
router.get('/completed', requireAuth, getCompletedTasks);
router.get('/:id', getTaskById);

// Protected routes
router.post('/:id/complete', requireAuth, completeTask);

export default router;
