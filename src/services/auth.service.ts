import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

export const AuthService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'E-mail já cadastrado.');

    const senhaHash = await bcrypt.hash(data.senha, 10);
    const user = await prisma.user.create({
      data: { nome: data.nome, email: data.email, senha: senhaHash },
      select: { id: true, nome: true, email: true },
    });

    return user;
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError(401, 'E-mail ou senha inválidos.');

    const senhaValida = await bcrypt.compare(data.senha, user.senha);
    if (!senhaValida) throw new AppError(401, 'E-mail ou senha inválidos.');

    const secret = process.env['JWT_SECRET'];
    if (!secret) throw new AppError(500, 'JWT_SECRET não configurado.');

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });

    return { token, user: { id: user.id, nome: user.nome, email: user.email } };
  },
};
