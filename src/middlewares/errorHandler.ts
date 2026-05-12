// Middleware de erros centralizado — deve ser o último `app.use()` registrado no Express
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erros de validação do Zod: retorna lista de campos inválidos para o cliente
  if (error instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      errors: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  // Erros operacionais conhecidos: repassa status e mensagem diretamente
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ code: error.code ?? 'APP_ERROR', error: error.message });
    return;
  }

  // Violação de constraint única do Prisma (ex: email duplicado por race condition)
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ code: 'CONFLICT', error: 'Recurso já existe.' });
    return;
  }

  // Erros inesperados: loga no servidor e oculta detalhes do cliente
  console.error(error);
  res.status(500).json({ code: 'INTERNAL_ERROR', error: 'Erro interno do servidor.' });
}
