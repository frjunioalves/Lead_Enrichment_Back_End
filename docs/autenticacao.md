# Sistema de Autenticação — Backend

## Visão geral

Autenticação stateless via JWT. Apenas os endpoints de registro e login são públicos; todas as demais rotas exigem o header `Authorization: Bearer <token>`.

## Dependências a instalar

```bash
npm install @prisma/client bcryptjs jsonwebtoken
npm install -D prisma @types/bcryptjs @types/jsonwebtoken
```

## Banco de dados (Prisma + PostgreSQL)

### Inicialização

```bash
npx prisma init          # gera prisma/schema.prisma e .env com DATABASE_URL
npx prisma migrate dev --name init
npx prisma generate
```

### Modelos (`prisma/schema.prisma`)

```prisma
model User {
  id        String        @id @default(uuid())
  nome      String
  email     String        @unique
  senha     String        # hash bcrypt
  criadoEm DateTime      @default(now()) @map("criado_em")
  historicos LeadHistory[]
  @@map("users")
}

model LeadHistory {
  id                       String   @id @default(uuid())
  userId                   String   @map("user_id")
  leadNome                 String   @map("lead_nome")
  leadEmail                String   @map("lead_email")
  leadTelefone             String   @map("lead_telefone")
  empresaCnpj              String   @map("empresa_cnpj")
  empresaRazaoSocial       String   @map("empresa_razao_social")
  empresaNomeFantasia       String?  @map("empresa_nome_fantasia")
  empresaSituacaoCadastral String   @map("empresa_situacao_cadastral")
  empresaDataAbertura      String?  @map("empresa_data_abertura")
  empresaCnaeCodigo        Int      @map("empresa_cnae_codigo")
  empresaCnaeDescricao     String   @map("empresa_cnae_descricao")
  empresaSegmento          String   @map("empresa_segmento")
  empresaFaixaFuncionarios String   @map("empresa_faixa_funcionarios")
  empresaLogradouro        String?  @map("empresa_logradouro")
  empresaBairro            String?  @map("empresa_bairro")
  empresaMunicipio         String?  @map("empresa_municipio")
  empresaUf                String?  @map("empresa_uf")
  empresaCep               String?  @map("empresa_cep")
  empresaFuso              String?  @map("empresa_fuso")
  empresaTelefone          String?  @map("empresa_telefone")
  empresaEmail             String?  @map("empresa_email")
  criadoEm                DateTime @default(now()) @map("criado_em")
  user User @relation(fields: [userId], references: [id])
  @@map("lead_histories")
}
```

## Variáveis de ambiente (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/enrichleads"
JWT_SECRET="troque-por-um-segredo-longo-e-aleatorio"
```

## Arquivos a criar

### `src/lib/prisma.ts`
Singleton do PrismaClient — importar de qualquer service sem instanciar múltiplas vezes.

### `src/types/express.d.ts`
Augmentation do tipo `Request` do Express para adicionar `req.user`:
```ts
declare namespace Express {
  interface Request {
    user?: { id: string; email: string };
  }
}
```

### `src/schemas/auth.schema.ts`
Schemas Zod para os dois endpoints públicos:
- `registerSchema` — `{ nome, email, senha }` (senha mínimo 6 chars)
- `loginSchema` — `{ email, senha }`

### `src/services/auth.service.ts`
| Função | Descrição |
|--------|-----------|
| `register(data)` | Verifica e-mail duplicado → hash bcrypt (rounds: 10) → cria User no banco → retorna `{ id, nome, email }` |
| `login(data)` | Busca user por e-mail → `bcrypt.compare` → `jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' })` → retorna `{ token, user: { id, nome, email } }` |

### `src/services/leadHistory.service.ts`
| Função | Descrição |
|--------|-----------|
| `saveHistory(userId, input, empresa)` | Persiste um registro em `lead_histories` combinando dados do formulário e da empresa enriquecida |
| `listByUser(userId)` | Retorna todos os registros do usuário ordenados por `criadoEm DESC` |

### `src/controllers/auth.controller.ts`
- `register(req, res, next)` — `POST /api/auth/register`
- `login(req, res, next)` — `POST /api/auth/login`

### `src/controllers/leadHistory.controller.ts`
- `listHistory(req, res, next)` — `GET /api/leads/history` — usa `req.user.id`

### `src/middlewares/auth.middleware.ts`
1. Lê `Authorization: Bearer <token>` do header
2. `jwt.verify(token, JWT_SECRET)` — lança `AppError(401)` se inválido/expirado
3. Injeta `req.user = { id, email }` e chama `next()`

### `src/routes/auth.routes.ts`
```
POST /api/auth/register  →  register  (sem middleware)
POST /api/auth/login     →  login     (sem middleware)
```

### `src/routes/leadHistory.routes.ts`
```
GET /api/leads/history  →  authMiddleware  →  listHistory
```

## Arquivos a modificar

### `src/routes/lead.routes.ts`
Adicionar `authMiddleware` antes do handler `enrichLead`:
```ts
router.post('/enrich', authMiddleware, enrichLead);
```

### `src/controllers/lead.controller.ts`
Após `const response = { nome, email, telefone, empresa }`, antes do `res.json`:
```ts
await leadHistoryService.saveHistory(req.user!.id, { nome, email, telefone }, empresa);
```

### `src/server.ts`
Registrar as novas rotas:
```ts
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadHistoryRoutes); // GET /history
```

## Endpoints resultantes

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/auth/register` | Público | Cria conta |
| `POST` | `/api/auth/login` | Público | Retorna JWT |
| `POST` | `/api/leads/enrich` | JWT | Enriquece lead e salva histórico |
| `GET` | `/api/leads/history` | JWT | Lista histórico do usuário |
| `GET` | `/cnpj/:cnpj` | JWT | Dados brutos da BrasilAPI |

## Fluxo de autenticação

```
POST /api/auth/login
  body: { email, senha }
  response: { token: "eyJ...", user: { id, nome, email } }

Requisições protegidas:
  Header: Authorization: Bearer eyJ...
  authMiddleware → req.user = { id, email } → controller
```
