// Rotas montadas em /api/leads — operações relacionadas ao enriquecimento de leads
import { Router } from 'express';
import { enrichLead } from '../controllers/lead.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.post('/enrich', authMiddleware, enrichLead);

export default router;
