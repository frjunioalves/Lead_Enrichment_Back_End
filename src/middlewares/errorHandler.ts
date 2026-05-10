import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      errors: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ code: error.code ?? 'APP_ERROR', error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ code: 'INTERNAL_ERROR', error: 'Erro interno do servidor.' });
}
