-- CreateTable
CREATE TABLE "pessoa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "culto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "culto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indisponibilidade" (
    "cultoId" INTEGER NOT NULL,
    "pessoaId" INTEGER NOT NULL,

    CONSTRAINT "indisponibilidade_pkey" PRIMARY KEY ("pessoaId","cultoId")
);

-- AddForeignKey
ALTER TABLE "indisponibilidade" ADD CONSTRAINT "indisponibilidade_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indisponibilidade" ADD CONSTRAINT "indisponibilidade_cultoId_fkey" FOREIGN KEY ("cultoId") REFERENCES "culto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
