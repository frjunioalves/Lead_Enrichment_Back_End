import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

// Rotas públicas de autenticação — não passam pelo authMiddleware
const router: Router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
