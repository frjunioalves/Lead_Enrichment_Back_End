import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

export const AuthService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'E-mail já cadastrado.');

    // Custo 10 de bcrypt: equilíbrio entre segurança e tempo de resposta (~100ms)
    const senhaHash = await bcrypt.hash(data.senha, 10);
    const user = await prisma.user.create({
      data: { nome: data.nome, email: data.email, senha: senhaHash },
      // select garante que o hash da senha nunca é retornado ao cliente
      select: { id: true, nome: true, email: true },
    });

    return user;
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    // Mensagem genérica para não revelar se o e-mail existe ou não (enumeração de usuários)
    if (!user) throw new AppError(401, 'E-mail ou senha inválidos.');

    const senhaValida = await bcrypt.compare(data.senha, user.senha);
    if (!senhaValida) throw new AppError(401, 'E-mail ou senha inválidos.');

    const secret = process.env['JWT_SECRET'];
    if (!secret) throw new AppError(500, 'JWT_SECRET não configurado.');

    // Token expira em 7 dias; o frontend não implementa refresh token
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });

    return { token, user: { id: user.id, nome: user.nome, email: user.email } };
  },
};
