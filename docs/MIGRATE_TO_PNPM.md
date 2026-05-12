# Migração para pnpm — Back-end

## Por que pnpm?

- Instalações mais rápidas (cache global via hard links)
- `node_modules` menor em disco
- Lockfile mais determinístico (`pnpm-lock.yaml`)
- Melhor isolamento de dependências

---

## Pré-requisitos

Instale o pnpm via corepack (recomendado):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Verifique a instalação:

```bash
pnpm --version
```

---

## Passos da migração

### 1. Remova os artefatos anteriores

```bash
rm -rf node_modules package-lock.json
```

### 2. Instale as dependências com pnpm

```bash
pnpm install
```

Isso gera o arquivo `pnpm-lock.yaml` automaticamente.

### 3. Gere o Prisma Client após a instalação

Como o projeto usa Prisma, regere o client após instalar:

```bash
pnpm prisma generate
```

### 4. Atualize o `.gitignore`

Certifique-se de que o `pnpm-lock.yaml` **não** está ignorado e que o `package-lock.json` está:

```gitignore
# Remova esta linha se existir:
# pnpm-lock.yaml

# Adicione esta linha:
package-lock.json
```

### 5. (Opcional) Adicione um arquivo `.npmrc`

Crie `.npmrc` na raiz do back-end para garantir comportamento consistente:

```ini
shamefully-hoist=true
strict-peer-dependencies=false
```

### 6. Comandos pnpm

| Ação                        | Comando pnpm                |
|-----------------------------|-----------------------------|
| Instalar dependências       | `pnpm install`              |
| Adicionar pacote            | `pnpm add <pkg>`            |
| Adicionar pacote dev        | `pnpm add -D <pkg>`         |
| Remover pacote              | `pnpm remove <pkg>`         |
| Rodar dev                   | `pnpm dev`                  |
| Build                       | `pnpm build`                |
| Iniciar servidor            | `pnpm start`                |
| Rodar Prisma CLI            | `pnpm prisma <cmd>`         |
| Rodar tsx                   | `pnpm tsx <arquivo>`        |

### 7. Commite o lockfile novo

```bash
git add pnpm-lock.yaml
git rm --cached package-lock.json   # se ainda estiver rastreado
git commit -m "chore: migrate to pnpm (back-end)"
```

---

## Verificação final

```bash
pnpm dev     # servidor deve iniciar com tsx watch
pnpm build   # prisma generate + tsc devem completar sem erros
```

---

## Problemas comuns

| Sintoma | Solução |
|---|---|
| `@prisma/client` não encontrado | Execute `pnpm prisma generate` após `pnpm install` |
| Módulo não encontrado em runtime | Adicione `shamefully-hoist=true` no `.npmrc` |
| Peer dependency warnings | Adicione `strict-peer-dependencies=false` no `.npmrc` |
| Erro de permissão no corepack | Execute `sudo corepack enable` |
| Variáveis de ambiente não carregadas | Verifique se o `.env` está na raiz do back-end |
