import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';

interface JwtPayload {
  id: string;
  email: string;
}

// Valida o Bearer JWT e popula req.user; qualquer erro de jwt.verify resulta em 401
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Token não fornecido.');
    }

    // Remove o prefixo "Bearer " (7 caracteres) para obter o token puro
    const token = authHeader.slice(7);
    const secret = process.env['JWT_SECRET'];
    if (!secret) throw new AppError(500, 'JWT_SECRET não configurado.');

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError(401, 'Token inválido ou expirado.'));
  }
}
