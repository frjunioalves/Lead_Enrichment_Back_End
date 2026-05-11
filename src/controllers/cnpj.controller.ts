// Controlador de consulta direta de CNPJ — expõe os dados brutos da BrasilAPI
import type { Request, Response, NextFunction } from 'express';
import { validateCNPJ, sanitizeCNPJ } from '../utils/validateCNPJ.js';
import { CNPJService } from '../services/cnpj.service.js';
import { AppError } from '../errors/AppError.js';

// GET /cnpj/:cnpj — valida o CNPJ localmente antes de consumir a API externa
export async function getCNPJ(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawParam = req.params['cnpj'];
    // req.params pode ser string ou string[] dependendo do router; normaliza para string
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
