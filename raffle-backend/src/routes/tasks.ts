import { Router } from 'express';
import {
  completeTask,
  getAvailableTasks,
  getCompletedTasks,
  getTaskById,
} from '../controllers/taskController';
import { optionalAuth, requireAuth } from '../middleware/auth';

const router = Router();

// Tasks list: optionalAuth so logged-in users get a curated drip-feed
router.get('/', optionalAuth, getAvailableTasks);
router.get('/completed', requireAuth, getCompletedTasks);
router.get('/:id', getTaskById);

// Protected routes
router.post('/:id/complete', requireAuth, completeTask);

export default router;
