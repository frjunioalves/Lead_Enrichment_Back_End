interface QSAMember {
  pais: string | null;
  nome_socio: string;
  codigo_pais: number | null;
  faixa_etaria: string;
  cnpj_cpf_do_socio: string;
  qualificacao_socio: string;
  codigo_faixa_etaria: number;
  data_entrada_sociedade: string | null;
  identificador_de_socio: number;
  cpf_representante_legal: string;
  nome_representante_legal: string;
  codigo_qualificacao_socio: number;
  qualificacao_representante_legal: string;
  codigo_qualificacao_representante_legal: number;
}

interface CnaeSecundario {
  codigo: number;
  descricao: string;
}

interface RegimeTributario {
  ano: number;
  cnpj_da_scp: string | null;
  forma_de_tributacao: string;
  quantidade_de_escrituracoes: number;
}

export interface BrasilApiCNPJResponse {
  cnpj: string;
  pais: string | null;
  email: string | null;
  uf: string | null;
  cep: string | null;
  qsa: QSAMember[];
  porte: string | null;
  bairro: string | null;
  numero: string | null;
  ddd_fax: string | null;
  municipio: string | null;
  logradouro: string | null;
  cnae_fiscal: number;
  codigo_pais: number | null;
  complemento: string | null;
  codigo_porte: number | null;
  razao_social: string;
  nome_fantasia: string | null;
  capital_social: number;
  ddd_telefone_1: string | null;
  ddd_telefone_2: string | null;
  opcao_pelo_mei: boolean | null;
  descricao_porte: string | null;
  codigo_municipio: number | null;
  cnaes_secundarios: CnaeSecundario[];
  natureza_juridica: string;
  regime_tributario: RegimeTributario[];
  situacao_especial: string | null;
  opcao_pelo_simples: boolean | null;
  situacao_cadastral: number;
  data_opcao_pelo_mei: string | null;
  data_exclusao_do_mei: string | null;
  cnae_fiscal_descricao: string;
  codigo_municipio_ibge: number | null;
  data_inicio_atividade: string | null;
  data_situacao_especial: string | null;
  data_opcao_pelo_simples: string | null;
  data_situacao_cadastral: string | null;
  nome_cidade_no_exterior: string | null;
  codigo_natureza_juridica: number;
  data_exclusao_do_simples: string | null;
  motivo_situacao_cadastral: number;
  ente_federativo_responsavel: string | null;
  identificador_matriz_filial: number;
  qualificacao_do_responsavel: number;
  descricao_situacao_cadastral: string;
  descricao_tipo_de_logradouro: string | null;
  descricao_motivo_situacao_cadastral: string;
  descricao_identificador_matriz_filial: string;
}
