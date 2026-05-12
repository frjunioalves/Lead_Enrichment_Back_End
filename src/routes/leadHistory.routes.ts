import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { listHistory } from '../controllers/leadHistory.controller.js';

const router = Router();

router.get('/history', authMiddleware, listHistory);

export default router;
