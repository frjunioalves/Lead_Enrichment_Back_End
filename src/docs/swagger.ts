import type { OpenAPIV3 } from 'openapi-types';

const serverUrl = process.env['API_URL'] ?? 'http://localhost:3000';

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Enriquecedor de Leads API',
    version: '1.0.0',
    description:
      'API para cadastro de usuários, autenticação JWT e enriquecimento de dados de leads via CNPJ (BrasilAPI).',
  },
  servers: [{ url: serverUrl }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterBody: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', minLength: 2, example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          senha: { type: 'string', minLength: 6, example: 'senha123' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          senha: { type: 'string', minLength: 1, example: 'senha123' },
        },
      },
      EnrichLeadBody: {
        type: 'object',
        required: ['nome', 'email', 'telefone', 'cnpj'],
        properties: {
          nome: { type: 'string', minLength: 1, example: 'Maria Souza' },
          email: { type: 'string', format: 'email', example: 'maria@empresa.com' },
          telefone: {
            type: 'string',
            example: '(11) 91234-5678',
            description: 'Formatos aceitos: (11) 91234-5678, 11912345678, (11) 9 1234-5678',
          },
          cnpj: {
            type: 'string',
            example: '11.222.333/0001-81',
            description: 'Com ou sem máscara (XX.XXX.XXX/XXXX-XX ou 14 dígitos)',
          },
        },
      },
      EnrichedCompany: {
        type: 'object',
        properties: {
          cnpj: { type: 'string', example: '11.222.333/0001-81' },
          razaoSocial: { type: 'string', example: 'EMPRESA EXEMPLO LTDA' },
          nomeFantasia: { type: 'string', nullable: true, example: 'Exemplo' },
          situacaoCadastral: { type: 'string', example: 'ATIVA' },
          dataAbertura: { type: 'string', nullable: true, example: '2010-03-15' },
          cnae: {
            type: 'object',
            properties: {
              codigo: { type: 'integer', example: 6201500 },
              descricao: {
                type: 'string',
                example: 'Desenvolvimento de programas de computador sob encomenda',
              },
            },
          },
          segmento: { type: 'string', example: 'Tecnologia da Informação' },
          faixaFuncionarios: { type: 'string', example: '10 a 49' },
          endereco: {
            type: 'object',
            properties: {
              logradouro: { type: 'string', nullable: true, example: 'Rua das Flores, 123' },
              bairro: { type: 'string', nullable: true, example: 'Centro' },
              municipio: { type: 'string', nullable: true, example: 'São Paulo' },
              uf: { type: 'string', nullable: true, example: 'SP' },
              cep: { type: 'string', nullable: true, example: '01310-100' },
              fuso: { type: 'string', nullable: true, example: 'America/Sao_Paulo' },
            },
          },
          telefone: { type: 'string', nullable: true, example: '(11) 3000-0000' },
          email: { type: 'string', nullable: true, example: 'contato@empresa.com' },
        },
      },
      LeadEnrichedResponse: {
        type: 'object',
        properties: {
          nome: { type: 'string', example: 'Maria Souza' },
          email: { type: 'string', example: 'maria@empresa.com' },
          telefone: { type: 'string', example: '(11) 91234-5678' },
          empresa: { $ref: '#/components/schemas/EnrichedCompany' },
        },
      },
      LeadHistory: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          nome: { type: 'string', example: 'Maria Souza' },
          email: { type: 'string', example: 'maria@empresa.com' },
          telefone: { type: 'string', example: '(11) 91234-5678' },
          cnpj: { type: 'string', example: '11.222.333/0001-81' },
          razaoSocial: { type: 'string', example: 'EMPRESA EXEMPLO LTDA' },
          nomeFantasia: { type: 'string', nullable: true },
          situacaoCadastral: { type: 'string', example: 'ATIVA' },
          segmento: { type: 'string', example: 'Tecnologia da Informação' },
          faixaFuncionarios: { type: 'string', example: '10 a 49' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Descrição do erro.' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastro de usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } },
          },
        },
        responses: {
          '201': {
            description: 'Usuário cadastrado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Usuário cadastrado com sucesso.' },
                    userId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '409': {
            description: 'E-mail já cadastrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Login do usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/leads/enrich': {
      post: {
        tags: ['Leads'],
        summary: 'Enriquecer dados de um lead via CNPJ',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/EnrichLeadBody' } },
          },
        },
        responses: {
          '200': {
            description: 'Lead enriquecido com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LeadEnrichedResponse' },
              },
            },
          },
          '400': {
            description: 'Dados inválidos ou CNPJ com formato incorreto',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'CNPJ não encontrado na Receita Federal',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/leads/history': {
      get: {
        tags: ['Leads'],
        summary: 'Listar histórico de enriquecimentos do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de histórico',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/LeadHistory' },
                },
              },
            },
          },
          '401': {
            description: 'Token ausente ou inválido',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/cnpj/{cnpj}': {
      get: {
        tags: ['CNPJ'],
        summary: 'Consulta direta de CNPJ na BrasilAPI (sem autenticação)',
        parameters: [
          {
            name: 'cnpj',
            in: 'path',
            required: true,
            schema: { type: 'string', example: '11222333000181' },
            description: 'CNPJ com 14 dígitos, sem máscara',
          },
        ],
        responses: {
          '200': {
            description: 'Dados brutos da Receita Federal',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '400': {
            description: 'CNPJ com formato inválido',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'CNPJ não encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
};
