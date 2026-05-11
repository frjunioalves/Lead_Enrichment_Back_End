// Schema de validação do body de POST /api/leads/enrich
import { z } from 'zod';
import { validateCNPJ, sanitizeCNPJ } from '../utils/validateCNPJ.js';

export const enrichLeadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório.'),
  email: z.email('Email inválido.'),
  // Aceita formatos com ou sem parênteses/espaços/hífen: (11) 91234-5678, 11912345678 etc.
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório.')
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.'),
  // sanitizeCNPJ antes de validateCNPJ permite aceitar CNPJ formatado (XX.XXX.XXX/XXXX-XX)
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório.')
    .refine((val) => validateCNPJ(sanitizeCNPJ(val)), { message: 'CNPJ inválido.' }),
});

// Tipo inferido do schema — usado como assinatura de entrada no controller
export type EnrichLeadInput = z.infer<typeof enrichLeadSchema>;
