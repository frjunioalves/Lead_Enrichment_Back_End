import type { Request, Response, NextFunction } from 'express';
import { sanitizeCNPJ } from '../utils/validateCNPJ.js';
import { CNPJService } from '../services/cnpj.service.js';
import { transformCNPJData } from '../utils/transformCNPJData.js';
import type { LeadEnrichedResponse } from '../types/enriched.types.js';
import { enrichLeadSchema } from '../schemas/lead.schema.js';

export async function enrichLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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
