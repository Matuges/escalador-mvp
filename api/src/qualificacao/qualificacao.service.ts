import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QualificacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async setQualificacao(pessoaId: number, funcaoId: number) {
    return this.prisma.qualificacao.upsert({
      create: { pessoaId: pessoaId, funcaoId: funcaoId },
      update: {},
      where: { pessoaId_funcaoId: { pessoaId: pessoaId, funcaoId: funcaoId } },
    });
  }

  // Aqui ele usa deleteMany por idempotência, ou seja, se não existe, não faz nada.
  async removeQualificacao(pessoaId: number, funcaoId: number) {
    return this.prisma.qualificacao.deleteMany({
      where: {
        pessoaId: pessoaId,
        funcaoId: funcaoId,
      },
    });
  }
}
