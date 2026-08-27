import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndisponibilidadeService {
  constructor(private readonly prisma: PrismaService) {}

  async setIndisponibilidade(pessoaId: number, cultoId: number) {
    return this.prisma.indisponibilidade.upsert({
      create: { pessoaId: pessoaId, cultoId: cultoId },
      update: {},
      where: { pessoaId_cultoId: { pessoaId: pessoaId, cultoId: cultoId } },
    });
  }

  // Aqui ele usa deleteMany por idempotência, ou seja, se não existe, não faz nada.
  async removeIndisponibilidade(pessoaId: number, cultoId: number) {
    return this.prisma.indisponibilidade.deleteMany({
      where: {
        pessoaId: pessoaId,
        cultoId: cultoId,
      },
    });
  }
}
