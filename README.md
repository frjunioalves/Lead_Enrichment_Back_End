# 🚀 Letalk - Lead Enrichment API

Esta é a API de backend desenvolvida para o teste técnico da Letalk. O objetivo principal desta aplicação é receber dados básicos de um lead (com foco no CNPJ), consultar a base pública da Receita Federal (via BrasilAPI) e retornar os dados estruturados e enriquecidos para o frontend.

## 🛠 Tecnologias Utilizadas

*   **Node.js & Express:** Framework base para construção da API REST.
*   **TypeScript:** Adição de tipagem estática para garantir segurança e previsibilidade do código.
*   **Axios:** Cliente HTTP para consumo da BrasilAPI.
*   **Zod (sugestão):** Para validação de dados de entrada e saída.

## ⚙️ Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto contendo as seguintes variáveis:

```env
PORT=3000
# Caso utilize banco de dados posteriormente, adicione a URL aqui:
# DATABASE_URL="postgresql://user:password@localhost:5432/letalk_db"