import { Router } from 'express';
import {
  createItem,
  deleteItem,
  getAllItems,
  getItemById,
  updateItem,
} from '../controllers/itemController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getAllItems);
router.get('/:id', getItemById);

// Admin routes (auth + admin required)
router.post('/', requireAuth, requireAdmin, upload.single('image'), createItem);
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), updateItem);
router.delete('/:id', requireAuth, requireAdmin, deleteItem);

export default router;
