FROM node:22-alpine
WORKDIR /app

ENV CI=true

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm rebuild @prisma/engines prisma esbuild

COPY . .

RUN pnpm prisma generate

EXPOSE 3000

CMD ["sh", "-c", "until nc -z postgres 5432; do echo 'waiting for postgres...'; sleep 2; done && pnpm prisma migrate deploy && pnpm tsx src/server.ts"]
