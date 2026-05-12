# Plano de Implementação: Swagger / OpenAPI no Backend

## Visão Geral

Adicionar documentação interativa via **Swagger UI** (OpenAPI 3.0) ao backend Express.
A documentação ficará acessível em `/api/docs` e cobrirá todos os endpoints existentes.

---

## Stack Atual

| Item | Valor |
|------|-------|
| Framework | Express 5.2.1 |
| Linguagem | TypeScript (strict) |
| Validação | Zod 4 |
| Autenticação | JWT (Bearer token) |
| ORM | Prisma + PostgreSQL |

---

## Pacotes a Instalar

```bash
npm install swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

> **Por que não `swagger-jsdoc`?**
> O projeto já usa Zod para validação dos schemas. Para evitar duplicação,
> o OpenAPI spec será escrito manualmente em um único arquivo JSON/YAML,
> mantendo a documentação como fonte de verdade separada e explícita.
> Se no futuro quiser gerar automaticamente a partir do Zod, considere `zod-to-openapi`.

---

## Estrutura de Arquivos a Criar

```
back-end/
└── src/
    ├── docs/
    │   ├── swagger.ts          ← objeto OpenAPI completo (spec)
    │   └── index.ts            ← exporta a instância configurada do swagger-ui-express
    └── server.ts               ← adicionar rota /api/docs (modificar)
```

---

## Endpoints a Documentar

### Autenticação — `POST /api/auth/register`
- **Body:** `{ email: string, password: string }`
- **Resposta 201:** `{ message: string, userId: string }`
- **Resposta 400:** Erros de validação Zod
- **Resposta 409:** E-mail já cadastrado

### Autenticação — `POST /api/auth/login`
- **Body:** `{ email: string, password: string }`
- **Resposta 200:** `{ token: string }`
- **Resposta 400:** Erros de validação
- **Resposta 401:** Credenciais inválidas

### Enriquecimento — `POST /api/leads/enrich`
- **Auth:** Bearer token (JWT)
- **Body:** `{ cnpj: string, name?: string, email?: string, phone?: string }`
- **Resposta 200:** Objeto `EnrichedLead` completo (dados da empresa + contato)
- **Resposta 400:** CNPJ inválido ou dados ausentes
- **Resposta 401:** Token ausente / inválido
- **Resposta 404:** CNPJ não encontrado na BrasilAPI

### Histórico — `GET /api/leads/history`
- **Auth:** Bearer token (JWT)
- **Resposta 200:** Array de `LeadHistory`
- **Resposta 401:** Token ausente / inválido

### CNPJ Direto — `GET /cnpj/:cnpj`
- **Sem autenticação**
- **Param:** `cnpj` — string com 14 dígitos (sem máscara)
- **Resposta 200:** Dados brutos da BrasilAPI
- **Resposta 400:** CNPJ com formato inválido
- **Resposta 404:** CNPJ não encontrado

---

## Schemas OpenAPI a Definir

```
components/schemas:
  RegisterBody
  LoginBody
  EnrichLeadBody
  EnrichedLead
  LeadHistory
  ErrorResponse
```

Os schemas `EnrichedLead` e `LeadHistory` serão baseados nos tipos em
`src/types/enriched.types.ts` e no model Prisma `lead_histories`.

---

## Passos de Implementação

### Passo 1 — Instalar dependências
```bash
npm install swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

### Passo 2 — Criar `src/docs/swagger.ts`
Escrever o objeto OpenAPI 3.0 completo com:
- `info` (título, versão, descrição)
- `servers` (localhost:3000)
- `components.securitySchemes` (bearerAuth JWT)
- `components.schemas` (todos listados acima)
- `paths` (todos os endpoints)

### Passo 3 — Criar `src/docs/index.ts`
Exportar função `setupSwagger(app: Express)` que registra a rota `/api/docs`.

```ts
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

### Passo 4 — Registrar no `src/server.ts`
Importar e chamar `setupSwagger(app)` antes de iniciar o servidor.
Deve ser carregado **após** os middlewares globais (cors, json) e
**antes ou depois** das rotas de API (sem interferência).

### Passo 5 — Validar e testar
- Acessar `http://localhost:3000/api/docs` no navegador
- Testar cada endpoint pelo Swagger UI (incluindo os que exigem Bearer token)
- Verificar se os schemas batem com os dados reais retornados pela API

---

## Considerações

| Tópico | Decisão |
|--------|---------|
| Formato da spec | Objeto TypeScript (`.ts`) — type-safe e sem build step adicional |
| Geração automática | Manual por ora; migrar para `zod-to-openapi` se a API crescer |
| Ambiente de produção | Manter `/api/docs` ativo — projeto não tem restrição de exposição |
| Versionamento da spec | Versionada junto ao código fonte no git |

---

## Ordem de Prioridade

1. `POST /api/auth/register` e `POST /api/auth/login` — base para testar autenticação
2. `POST /api/leads/enrich` — endpoint principal do produto
3. `GET /api/leads/history` — complementar
4. `GET /cnpj/:cnpj` — utilitário público

---

_Arquivo gerado em 2026-05-12 como guia de implementação._
