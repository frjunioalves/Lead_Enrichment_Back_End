import prisma from '../lib/prisma.js';
import type { EnrichLeadInput } from '../schemas/lead.schema.js';
import type { EnrichedCompany } from '../types/enriched.types.js';

export const LeadHistoryService = {
  async saveHistory(userId: string, input: EnrichLeadInput, empresa: EnrichedCompany) {
    await prisma.leadHistory.create({
      data: {
        userId,
        leadNome: input.nome,
        leadEmail: input.email,
        leadTelefone: input.telefone,
        empresaCnpj: empresa.cnpj,
        empresaRazaoSocial: empresa.razaoSocial,
        empresaNomeFantasia: empresa.nomeFantasia,
        empresaSituacaoCadastral: empresa.situacaoCadastral,
        empresaDataAbertura: empresa.dataAbertura,
        empresaCnaeCodigo: empresa.cnae.codigo,
        empresaCnaeDescricao: empresa.cnae.descricao,
        empresaSegmento: empresa.segmento,
        empresaFaixaFuncionarios: empresa.faixaFuncionarios,
        empresaLogradouro: empresa.endereco.logradouro,
        empresaBairro: empresa.endereco.bairro,
        empresaMunicipio: empresa.endereco.municipio,
        empresaUf: empresa.endereco.uf,
        empresaCep: empresa.endereco.cep,
        empresaFuso: empresa.endereco.fuso,
        empresaTelefone: empresa.telefone,
        empresaEmail: empresa.email,
      },
    });
  },

  async listByUser(userId: string) {
    return prisma.leadHistory.findMany({
      where: { userId },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        leadNome: true,
        leadEmail: true,
        leadTelefone: true,
        empresaCnpj: true,
        empresaRazaoSocial: true,
        empresaNomeFantasia: true,
        empresaSituacaoCadastral: true,
        empresaDataAbertura: true,
        empresaCnaeCodigo: true,
        empresaCnaeDescricao: true,
        empresaSegmento: true,
        empresaFaixaFuncionarios: true,
        empresaLogradouro: true,
        empresaBairro: true,
        empresaMunicipio: true,
        empresaUf: true,
        empresaCep: true,
        empresaFuso: true,
        empresaTelefone: true,
        empresaEmail: true,
        criadoEm: true,
      },
    });
  },
};
