-- CreateTable
CREATE TABLE "resposta_disponibilidade" (
    "id" SERIAL NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resposta_disponibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_formulario" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "diaCorte" INTEGER NOT NULL DEFAULT 20,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_formulario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resposta_disponibilidade_pessoaId_key" ON "resposta_disponibilidade"("pessoaId");

-- AddForeignKey
ALTER TABLE "resposta_disponibilidade" ADD CONSTRAINT "resposta_disponibilidade_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
