-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lead_nome" TEXT NOT NULL,
    "lead_email" TEXT NOT NULL,
    "lead_telefone" TEXT NOT NULL,
    "empresa_cnpj" TEXT NOT NULL,
    "empresa_razao_social" TEXT NOT NULL,
    "empresa_nome_fantasia" TEXT,
    "empresa_situacao_cadastral" TEXT NOT NULL,
    "empresa_data_abertura" TEXT,
    "empresa_cnae_codigo" INTEGER NOT NULL,
    "empresa_cnae_descricao" TEXT NOT NULL,
    "empresa_segmento" TEXT NOT NULL,
    "empresa_faixa_funcionarios" TEXT NOT NULL,
    "empresa_logradouro" TEXT,
    "empresa_bairro" TEXT,
    "empresa_municipio" TEXT,
    "empresa_uf" TEXT,
    "empresa_cep" TEXT,
    "empresa_fuso" TEXT,
    "empresa_telefone" TEXT,
    "empresa_email" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "lead_histories" ADD CONSTRAINT "lead_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
