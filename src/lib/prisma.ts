import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

// PrismaPg usa o driver nativo pg em vez do driver padrão, necessário para o modo de edge functions
const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

// Singleton exportado — evita múltiplas conexões em hot-reload durante desenvolvimento
export default prisma;
