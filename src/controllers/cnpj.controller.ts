import type { Request, Response, NextFunction } from 'express';
import { validateCNPJ, sanitizeCNPJ } from '../utils/validateCNPJ.js';
import { CNPJService } from '../services/cnpj.service.js';
import { AppError } from '../errors/AppError.js';

export async function getCNPJ(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawParam = req.params['cnpj'];
    const raw = Array.isArray(rawParam) ? (rawParam[0] ?? '') : (rawParam ?? '');
    const cnpj = sanitizeCNPJ(raw);

    if (!validateCNPJ(cnpj)) {
      throw new AppError(400, 'CNPJ inválido.');
    }

    const data = await CNPJService.fetchByCNPJ(cnpj);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
