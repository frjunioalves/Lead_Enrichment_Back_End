// Controlador de enriquecimento de lead — combina dados do formulário com dados da Receita Federal
import type { Request, Response, NextFunction } from 'express';
import { sanitizeCNPJ } from '../utils/validateCNPJ.js';
import { CNPJService } from '../services/cnpj.service.js';
import { transformCNPJData } from '../utils/transformCNPJData.js';
import type { LeadEnrichedResponse } from '../types/enriched.types.js';
import { enrichLeadSchema } from '../schemas/lead.schema.js';

// POST /api/leads/enrich — valida o body via Zod e retorna o lead com dados da empresa
export async function enrichLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // parse() lança ZodError automaticamente se o body for inválido; capturado pelo errorHandler
    const { nome, email, telefone, cnpj: rawCnpj } = enrichLeadSchema.parse(req.body);

    const cnpj = sanitizeCNPJ(rawCnpj);
    const rawData = await CNPJService.fetchByCNPJ(cnpj);
    const empresa = transformCNPJData(rawData);

    const response: LeadEnrichedResponse = { nome, email, telefone, empresa };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
