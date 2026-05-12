// Estende Express.Request com a propriedade `user` populada pelo authMiddleware após validação do JWT
declare namespace Express {
  interface Request {
    user?: { id: string; email: string };
  }
}
