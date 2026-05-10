import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor.' });
}
