-- CreateTable
CREATE TABLE "funcao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ministerioId" INTEGER NOT NULL,

    CONSTRAINT "funcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministerio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "ministerio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualificacao" (
    "funcaoId" INTEGER NOT NULL,
    "pessoaId" INTEGER NOT NULL,

    CONSTRAINT "qualificacao_pkey" PRIMARY KEY ("pessoaId","funcaoId")
);

-- AddForeignKey
ALTER TABLE "funcao" ADD CONSTRAINT "funcao_ministerioId_fkey" FOREIGN KEY ("ministerioId") REFERENCES "ministerio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualificacao" ADD CONSTRAINT "qualificacao_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualificacao" ADD CONSTRAINT "qualificacao_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
