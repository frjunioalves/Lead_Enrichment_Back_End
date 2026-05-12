import axios, { AxiosError } from 'axios';
import type { BrasilApiCEPResponse } from '../types/brasilapi.types.js';
import { AppError } from '../errors/AppError.js';

const BASE_URL = process.env['BRASILAPI_URL'] ?? 'https://brasilapi.com.br/api/';
const TIMEOUT_MS = Number(process.env['BRASILAPI_TIMEOUT_MS'] ?? 5000);

// Encapsula chamadas à BrasilAPI para consulta de CEP e mapeia erros HTTP para AppError
export class CEPService {
  static async fetchByCEP(cep: string): Promise<BrasilApiCEPResponse> {
    try {
      const { data } = await axios.get<BrasilApiCEPResponse>(`${BASE_URL}cep/v2/${cep}`, {
        timeout: TIMEOUT_MS,
      });
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const { status } = error.response;
        if (status === 400) throw new AppError(400, 'CEP deve conter exatamente 8 dígitos.');
        if (status === 404) throw new AppError(404, 'CEP não encontrado.');
        throw new AppError(502, 'Erro ao consultar o serviço de CEP. Tente novamente mais tarde.');
      }
      // Ausência de error.response indica timeout ou falha de rede
      throw new AppError(504, 'Timeout ao consultar o serviço de CEP.');
    }
  }
}
