import { Router } from 'express';
import { getCNPJ } from '../controllers/cnpj.controller.js';

const router = Router();

router.get('/:cnpj', getCNPJ);

export default router;
