// Erro operacional esperado (ex: 404, 400, 502). Distingue-se de erros de programação
// para que o errorHandler possa retornar a mensagem ao cliente sem vazar stack traces.
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string // código semântico para facilitar o tratamento no frontend
  ) {
    super(message);
    this.name = 'AppError';
  }
}
