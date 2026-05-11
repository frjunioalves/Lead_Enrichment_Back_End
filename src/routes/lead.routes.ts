// Rotas montadas em /api/leads — operações relacionadas ao enriquecimento de leads
import { Router } from 'express';
import { enrichLead } from '../controllers/lead.controller.js';

const router = Router();

// POST /api/leads/enrich — recebe dados do lead e retorna empresa enriquecida via CNPJ
router.post('/enrich', enrichLead);

export default router;
