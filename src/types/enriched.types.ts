// Tipos do domínio da aplicação — resultado do enriquecimento de dados de uma empresa

export interface EnrichedCompany {
  cnpj: string; // Formato XX.XXX.XXX/XXXX-XX
  razaoSocial: string;
  nomeFantasia: string | null;
  situacaoCadastral: string;
  dataAbertura: string | null;
  cnae: {
    codigo: number;
    descricao: string;
  };
  segmento: string;
  faixaFuncionarios: string;
  endereco: {
    logradouro: string | null;
    bairro: string | null;
    municipio: string | null;
    uf: string | null;
    cep: string | null;
    fuso: string | null;
  };
  telefone: string | null;
  email: string | null;
}

export interface LeadEnrichedResponse {
  nome: string;
  email: string;
  telefone: string;
  empresa: EnrichedCompany;
}
