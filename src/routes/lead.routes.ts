import { Router } from 'express';
import { enrichLead } from '../controllers/lead.controller.js';

const router = Router();

router.post('/enrich', enrichLead);

export default router;
