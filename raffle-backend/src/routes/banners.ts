import { Router } from 'express';
import { getPublicBanners } from '../controllers/bannerController';

const router = Router();

// GET /api/banners — Public
router.get('/', getPublicBanners);

export default router;
