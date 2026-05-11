// Transforma a resposta bruta da BrasilAPI para o formato enriquecido da aplicação
import type { BrasilApiCNPJResponse, BrasilApiCEPResponse } from '../types/brasilapi.types.js';
import type { EnrichedCompany } from '../types/enriched.types.js';

function formatCEP(cep: string): string {
  const d = cep.replace(/\D/g, '').padStart(8, '0');
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

// Formata string numérica de CNPJ para o padrão XX.XXX.XXX/XXXX-XX
function formatCNPJ(cnpj: string): string {
  const d = cnpj.replace(/\D/g, '').padStart(14, '0');
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

// Converte data ISO (YYYY-MM-DD) para o formato brasileiro (dd/mm/yyyy)
function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return null;
  return `${day}/${month}/${year}`;
}

// Formata o campo ddd_telefone_1 da BrasilAPI para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
function formatPhone(dddPhone: string | null): string | null {
  if (!dddPhone) return null;
  const digits = dddPhone.replace(/\D/g, '');
  if (digits.length === 11) {
    // Celular: 11 dígitos com 9 na frente
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    // Fixo: 10 dígitos
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Retorna como recebido se não se encaixa nos formatos esperados
  return dddPhone;
}

// Mapa de porte (código Receita Federal) para faixa de funcionários legível
const PORTE_MAP: Record<string, string> = {
  ME: 'Microempresa (até 9 funcionários)',
  EPP: 'Empresa de Pequeno Porte (10 a 49 funcionários)',
  DEMAIS: 'Empresa de Médio/Grande Porte (50+ funcionários)',
  'NAO INFORMADO': 'Não informado',
};

function mapPorte(porte: string | null): string {
  if (!porte) return 'Não informado';
  return PORTE_MAP[porte] ?? 'Não informado';
}

// Mapeia a divisão do CNAE (2 primeiros dígitos do código de 7 dígitos) ao segmento de mercado
// seguindo as seções A–U da classificação IBGE/CONCLA
function mapCNAEToSegmento(cnaeFiscal: number): string {
  const division = Math.floor(cnaeFiscal / 100000);
  if (division >= 1 && division <= 3) return 'Agronegócio';
  if (division >= 5 && division <= 9) return 'Indústrias Extrativas';
  if (division >= 10 && division <= 33) return 'Indústria de Transformação';
  if (division === 35) return 'Energia e Gás';
  if (division >= 36 && division <= 39) return 'Saneamento e Meio Ambiente';
  if (division >= 41 && division <= 43) return 'Construção Civil';
  if (division >= 45 && division <= 47) return 'Comércio';
  if (division >= 49 && division <= 53) return 'Transporte e Logística';
  if (division >= 55 && division <= 56) return 'Alimentação e Hospedagem';
  if (division >= 58 && division <= 63) return 'Tecnologia e Comunicação';
  if (division >= 64 && division <= 66) return 'Serviços Financeiros';
  if (division === 68) return 'Imobiliário';
  if (division >= 69 && division <= 75) return 'Serviços Profissionais e Técnicos';
  if (division >= 77 && division <= 82) return 'Serviços Administrativos';
  if (division === 84) return 'Administração Pública';
  if (division === 85) return 'Educação';
  if (division >= 86 && division <= 88) return 'Saúde e Serviços Sociais';
  if (division >= 90 && division <= 93) return 'Cultura, Esporte e Lazer';
  if (division >= 94 && division <= 96) return 'Outros Serviços';
  if (division >= 97 && division <= 98) return 'Serviços Domésticos';
  if (division === 99) return 'Organismos Internacionais';
  return 'Não classificado';
}

// A BrasilAPI retorna strings em maiúsculas; converte para Title Case para exibição
function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Ponto de entrada do módulo — converte o payload bruto da BrasilAPI para EnrichedCompany
export function transformCNPJData(raw: BrasilApiCNPJResponse, cep?: BrasilApiCEPResponse): EnrichedCompany {
  return {
    cnpj: formatCNPJ(raw.cnpj),
    razaoSocial: raw.razao_social,
    nomeFantasia: raw.nome_fantasia || null,
    situacaoCadastral: toTitleCase(raw.descricao_situacao_cadastral),
    dataAbertura: formatDate(raw.data_inicio_atividade),
    cnae: {
      codigo: raw.cnae_fiscal,
      descricao: raw.cnae_fiscal_descricao,
    },
    segmento: mapCNAEToSegmento(raw.cnae_fiscal),
    faixaFuncionarios: mapPorte(raw.porte),
    endereco: {
      logradouro: cep?.street ?? raw.logradouro ?? null,
      bairro: cep?.neighborhood ?? raw.bairro ?? null,
      municipio: cep?.city ?? raw.municipio ?? null,
      uf: cep?.state ?? raw.uf ?? null,
      cep: raw.cep ? formatCEP(raw.cep) : null,
      fuso: cep?.timezoneName ?? null,
    },
    telefone: formatPhone(raw.ddd_telefone_1),
    email: raw.email || null,
  };
}
