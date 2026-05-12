import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { listHistory } from '../controllers/leadHistory.controller.js';

// Rota protegida — authMiddleware verifica JWT antes de delegar ao controller
const router = Router();

router.get('/history', authMiddleware, listHistory);

export default router;
