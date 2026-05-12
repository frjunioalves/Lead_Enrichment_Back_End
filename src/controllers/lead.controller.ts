// Controlador de enriquecimento de lead — combina dados do formulário com dados da Receita Federal
import type { Request, Response, NextFunction } from 'express';
import { sanitizeCNPJ } from '../utils/validateCNPJ.js';
import { CNPJService } from '../services/cnpj.service.js';
import { CEPService } from '../services/cep.service.js';
import { transformCNPJData } from '../utils/transformCNPJData.js';
import { LeadHistoryService } from '../services/leadHistory.service.js';
import type { LeadEnrichedResponse } from '../types/enriched.types.js';
import type { BrasilApiCEPResponse } from '../types/brasilapi.types.js';
import { enrichLeadSchema } from '../schemas/lead.schema.js';

// POST /api/leads/enrich — valida o body via Zod e retorna o lead com dados da empresa
export async function enrichLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // parse() lança ZodError automaticamente se o body for inválido; capturado pelo errorHandler
    const { nome, email, telefone, cnpj: rawCnpj } = enrichLeadSchema.parse(req.body);

    const cnpj = sanitizeCNPJ(rawCnpj);
    const rawData = await CNPJService.fetchByCNPJ(cnpj);

    // Busca de CEP é best-effort: falha silenciosa não interrompe o fluxo principal
    let cepData: BrasilApiCEPResponse | undefined;
    if (rawData.cep) {
      const cleanCep = rawData.cep.replace(/\D/g, '');
      cepData = await CEPService.fetchByCEP(cleanCep).catch(() => undefined);
    }

    const empresa = transformCNPJData(rawData, cepData);

    await LeadHistoryService.saveHistory(req.user!.id, { nome, email, telefone, cnpj: rawCnpj }, empresa);

    const response: LeadEnrichedResponse = { nome, email, telefone, empresa };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
