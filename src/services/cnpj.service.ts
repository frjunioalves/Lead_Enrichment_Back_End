import axios, { AxiosError } from 'axios';
import type { BrasilApiCNPJResponse } from '../types/brasilapi.types.js';
import { AppError } from '../errors/AppError.js';

const BASE_URL = process.env['BRASILAPI_URL'] ?? 'https://brasilapi.com.br/api/';
const TIMEOUT_MS = Number(process.env['BRASILAPI_TIMEOUT_MS'] ?? 5000);

export class CNPJService {
  static async fetchByCNPJ(cnpj: string): Promise<BrasilApiCNPJResponse> {
    try {
      const { data } = await axios.get<BrasilApiCNPJResponse>(`${BASE_URL}cnpj/v1/${cnpj}`, {
        timeout: TIMEOUT_MS,
      });
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const { status } = error.response;
        if (status === 404) throw new AppError(404, 'CNPJ não encontrado na base de dados.');
        if (status === 429) throw new AppError(429, 'Limite de requisições atingido. Tente novamente em instantes.');
        throw new AppError(502, 'Erro ao consultar a BrasilAPI. Tente novamente mais tarde.');
      }
      throw new AppError(504, 'Timeout ao consultar a BrasilAPI.');
    }
  }
}
