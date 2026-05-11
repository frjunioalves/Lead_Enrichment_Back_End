// Rotas montadas em /cnpj — consulta direta de CNPJ na BrasilAPI
import { Router } from 'express';
import { getCNPJ } from '../controllers/cnpj.controller.js';

const router = Router();

// GET /cnpj/:cnpj — retorna dados brutos da Receita Federal para o CNPJ informado
router.get('/:cnpj', getCNPJ);

export default router;
