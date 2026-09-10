import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndisponibilidadeService {
  constructor(private readonly prisma: PrismaService) {}

  async setIndisponibilidade(pessoaId: number, cultoId: number) {
    return this.prisma.indisponibilidade.upsert({
      create: { pessoaId, cultoId },
      update: {},
      where: { pessoaId_cultoId: { pessoaId, cultoId } },
    });
  }

  // deleteMany por idempotência: se não existe, não faz nada.
  async removeIndisponibilidade(pessoaId: number, cultoId: number) {
    return this.prisma.indisponibilidade.deleteMany({
      where: { pessoaId, cultoId },
    });
  }

  async findPorCulto(
    cultoId: number,
    funcaoId?: number,
    ministerioId?: number,
  ) {
    const filtroQualificacao =
      funcaoId !== undefined
        ? { some: { funcaoId } }
        : ministerioId !== undefined
          ? { some: { funcao: { ministerioId } } }
          : undefined;

    const pessoas = await this.prisma.pessoa.findMany({
      where: filtroQualificacao
        ? { qualificacoes: filtroQualificacao }
        : undefined,
      include: {
        indisponibilidades: {
          where: { cultoId },
        },
      },
    });

    return pessoas.map((pessoa) => ({
      pessoa: pessoa.nome,
      id: pessoa.id,
      disponivel: pessoa.indisponibilidades.length === 0,
    }));
  }

  async findPorPessoa(pessoaId: number) {
    const cultos = await this.prisma.culto.findMany({
      include: {
        indisponibilidades: {
          where: { pessoaId },
        },
      },
    });

    return cultos.map((culto) => ({
      culto: culto.nome,
      id: culto.id,
      data: culto.data,
      disponivel: culto.indisponibilidades.length === 0,
    }));
  }
}
