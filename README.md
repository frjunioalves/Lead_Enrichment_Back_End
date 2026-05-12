# Enriquecedor de Leads — Backend

API REST que recebe dados de um lead com CNPJ, consulta a BrasilAPI, enriquece as informações com segmento de mercado, faixa de funcionários e fuso horário, persiste no PostgreSQL e retorna ao frontend.

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 5 | Framework HTTP |
| TypeScript | 6 | Tipagem estática |
| Prisma | 7 | ORM + migrations |
| PostgreSQL | 16 | Banco de dados |
| JWT (jsonwebtoken) | 9 | Autenticação stateless |
| bcryptjs | 3 | Hash de senhas |
| Zod | 4 | Validação de entrada |
| Axios | 1 | Cliente HTTP para BrasilAPI |

## Pré-requisitos

- Docker e Docker Compose

## Como rodar

### Opção A — Docker (recomendado)

Sobe PostgreSQL + API em um único comando. As migrations rodam automaticamente no startup.

```bash
docker compose up --build
```

| Serviço | Porta no host |
|---|---|
| API (Express) | `3000` |
| PostgreSQL | `5433` |

Para sobrescrever credenciais ou o JWT secret, crie um `.env` antes de subir:

```env
POSTGRES_USER=enrichleads
POSTGRES_PASSWORD=enrichleads
POSTGRES_DB=enrichleads
JWT_SECRET=troque_por_um_segredo_forte
```

### Opção B — Desenvolvimento local

#### 1. Suba apenas o banco

```bash
docker compose up -d postgres
```

#### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

`.env`:

```env
PORT=3000
DATABASE_URL=postgresql://enrichleads:enrichleads@localhost:5433/enrichleads

JWT_SECRET=troque_por_um_segredo_forte

BRASILAPI_URL=https://brasilapi.com.br/api/
BRASILAPI_TIMEOUT_MS=5000
```

#### 3. Instale dependências e rode as migrations

```bash
npm install
npx prisma migrate dev
npm run dev
```

A API estará disponível em `http://localhost:3000`.

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia com tsx watch (HMR) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Executa o build de produção |

## Endpoints

### Auth

```
POST /api/auth/register
Body: { nome, email, senha }

POST /api/auth/login
Body: { email, senha }
Response: { token, user: { id, nome, email } }
```

### Leads (requer `Authorization: Bearer <token>`)

```
POST /api/leads/enrich
Body: { nome, email, telefone, cnpj }
Response: EnrichedCompany (dados completos da empresa)

GET /api/leads/history
Response: LeadHistory[] (histórico do usuário autenticado)
```

### Consulta direta

```
GET /cnpj/:cnpj
Response: resposta bruta da BrasilAPI
```

## Estrutura do projeto

```
src/
├── controllers/       # Camada HTTP — parse de req/res
│   ├── auth.controller.ts
│   ├── lead.controller.ts
│   ├── leadHistory.controller.ts
│   └── cnpj.controller.ts
├── services/          # Regras de negócio
│   ├── auth.service.ts       # register + login com JWT
│   ├── cnpj.service.ts       # consulta BrasilAPI CNPJ
│   ├── cep.service.ts        # consulta BrasilAPI CEP
│   └── leadHistory.service.ts
├── middlewares/
│   ├── auth.middleware.ts    # verifica JWT e anexa user ao req
│   └── errorHandler.ts       # captura AppError e erros inesperados
├── routes/            # Declaração de rotas por domínio
├── schemas/           # Zod — validação de body
├── types/             # BrasilApiCNPJResponse, EnrichedCompany, etc.
├── utils/
│   ├── transformCNPJData.ts  # mapeia BrasilAPI → EnrichedCompany
│   └── validateCNPJ.ts       # valida dígito verificador
├── lib/
│   └── prisma.ts             # singleton do PrismaClient
├── errors/
│   └── AppError.ts           # erro estruturado com statusCode
└── server.ts                 # entry point — middlewares + rotas
```

## Enriquecimento de dados

O `transformCNPJData` aplica as seguintes transformações sobre o payload bruto da BrasilAPI:

| Campo BrasilAPI | Campo enriquecido | Transformação |
|---|---|---|
| `cnae_fiscal` | `segmento` | Mapeamento divisão CNAE → seção IBGE/CONCLA |
| `porte` | `faixaFuncionarios` | ME / EPP / DEMAIS → descrição legível |
| `ddd_telefone_1` | `telefone` | Formata para `(XX) XXXXX-XXXX` |
| `cep` (via BrasilAPI CEP) | `bairro`, `fuso` | Consulta endpoint `/cep/v1/{cep}` |
| `data_inicio_atividade` | `dataAbertura` | ISO → `dd/mm/yyyy` |

## Modelo de dados (Prisma)

![Modelagem do banco](images/1.png)

---

## Decisões de projeto e justificativas

Escolhi Express pela sua simplicidade — se fosse um projeto maior provavelmente teria optado pelo NestJS, principalmente por ser mais robusto. Desde o princípio queria que o front-end e o back-end fossem separados, facilitando deploys independentes e reuso da API por outros clientes. Fiz esse projeto de ponta a ponta e me diverti muito: desde a concepção da arquitetura e modelagem do banco de dados até a aplicação de conceitos de DevOps como CI/CD, Docker, Gitflow e deploy na Azure Web Service.

---

## Como a IA te ajudou a construir essa solução

A IA foi utilizada principalmente para tirar dúvidas sobre features e discutir melhores formas de implementação.

No início do projeto ela não foi usada com frequência para geração de código, pois a fase inicial envolveu definir a arquitetura e experimentar bibliotecas novas como Zod e Prisma. Essa exploração foi feita de forma autônoma para consolidar o entendimento antes de delegar qualquer implementação.

Após essa etapa, adotei um fluxo estruturado de desenvolvimento com IA:

1. **Descrição completa da feature** — escopo, limitações, padrões a seguir e comportamento esperado eram documentados antes de qualquer código.
2. **Geração de um arquivo `.md`** — a IA produzia um documento descrevendo a implementação proposta, que eu revisava e corrigia conforme necessário.
3. **Implementação** — somente após o `.md` estar aprovado a IA gerava o código, e eu verificava se o resultado estava alinhado com o que havia sido especificado.

Todas as decisões de arquitetura, revisão de código e validação dos resultados foram feitas por mim ao longo de todo o processo.

---

## Tempo gasto na execução do desafio

Entre 10 e 15 horas.

---

## Se você tivesse mais tempo, o que teria feito?

- Teria feito uma documentação melhor, listando os requisitos, e aplicado de forma mais adequada os conceitos de Gitflow.
- **Testes automatizados**: testes de integração com Supertest + banco em memória.
- **Refresh token**: o JWT expira em 7 dias sem renovação automática; implementaria um fluxo de refresh para manter a sessão ativa de forma segura.
