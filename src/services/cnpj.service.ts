// Camada de acesso à BrasilAPI — encapsula HTTP e mapeia erros externos para AppError
import axios, { AxiosError } from 'axios';
import type { BrasilApiCNPJResponse } from '../types/brasilapi.types.js';
import { AppError } from '../errors/AppError.js';

// Permite sobrescrever a URL e o timeout via variáveis de ambiente (útil em testes e staging)
const BASE_URL = process.env['BRASILAPI_URL'] ?? 'https://brasilapi.com.br/api/';
const TIMEOUT_MS = Number(process.env['BRASILAPI_TIMEOUT_MS'] ?? 5000);

export class CNPJService {
  // Consulta os dados de um CNPJ já sanitizado (apenas dígitos) na BrasilAPI
  static async fetchByCNPJ(cnpj: string): Promise<BrasilApiCNPJResponse> {
    try {
      const { data } = await axios.get<BrasilApiCNPJResponse>(`${BASE_URL}cnpj/v1/${cnpj}`, {
        timeout: TIMEOUT_MS,
      });
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const { status } = error.response;
        // Mapeia códigos HTTP da BrasilAPI para erros semânticos da aplicação
        if (status === 404) throw new AppError(404, 'CNPJ não encontrado na base de dados.');
        if (status === 429) throw new AppError(429, 'Limite de requisições atingido. Tente novamente em instantes.');
        throw new AppError(502, 'Erro ao consultar a BrasilAPI. Tente novamente mais tarde.');
      }
      // Sem `error.response` indica que a requisição não recebeu resposta (timeout ou rede)
      throw new AppError(504, 'Timeout ao consultar a BrasilAPI.');
    }
  }
}
