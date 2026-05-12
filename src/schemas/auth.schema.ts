import { z } from 'zod';

// Validação de cadastro: mínimo de 6 caracteres na senha para resistir a ataques de força bruta simples
export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  email: z.email('E-mail inválido.'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
});

// Login aceita qualquer senha não-vazia — a verificação real é feita pelo bcrypt no AuthService
export const loginSchema = z.object({
  email: z.email('E-mail inválido.'),
  senha: z.string().min(1, 'Senha é obrigatória.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
