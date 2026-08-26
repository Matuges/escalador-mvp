-- DropForeignKey
ALTER TABLE "funcao" DROP CONSTRAINT "funcao_ministerioId_fkey";

-- DropForeignKey
ALTER TABLE "qualificacao" DROP CONSTRAINT "qualificacao_funcaoId_fkey";

-- AlterTable
ALTER TABLE "pessoa" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "funcao" ADD CONSTRAINT "funcao_ministerioId_fkey" FOREIGN KEY ("ministerioId") REFERENCES "ministerio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualificacao" ADD CONSTRAINT "qualificacao_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
