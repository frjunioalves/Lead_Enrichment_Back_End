import { z } from 'zod';
import { validateCNPJ, sanitizeCNPJ } from '../utils/validateCNPJ.js';

export const enrichLeadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório.'),
  email: z.email('Email inválido.'),
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório.')
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.'),
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório.')
    .refine((val) => validateCNPJ(sanitizeCNPJ(val)), { message: 'CNPJ inválido.' }),
});

export type EnrichLeadInput = z.infer<typeof enrichLeadSchema>;
