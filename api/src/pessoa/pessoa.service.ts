import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePessoaDto) {
    return this.prisma.pessoa.create({
      data: {
        nome: dto.nome,
      },
    });
  }

  async findAll(funcaoId?: number, incluirInativos?: boolean) {
    return this.prisma.pessoa.findMany({
      where: {
        ...(incluirInativos ? undefined : { ativo: true }),
        ...(funcaoId !== undefined
          ? { qualificacoes: { some: { funcaoId } } }
          : undefined),
      },
    });
  }

  async findUnique(id: number) {
    return this.prisma.pessoa.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, dto: UpdatePessoaDto) {
    return this.prisma.pessoa.update({
      data: {
        nome: dto.nome,
      },
      where: {
        id: id,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.pessoa.update({
      data: {
        ativo: false,
      },
      where: {
        id: id,
      },
    });
  }

  async reativar(id: number) {
    return this.prisma.pessoa.update({
      data: {
        ativo: true,
      },
      where: {
        id: id,
      },
    });
  }

  async findDisponibilidade(id: number) {
    const cultos = await this.prisma.culto.findMany({
      include: {
        indisponibilidades: {
          where: { pessoaId: id },
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

  async findQualificacao(id: number) {
    const funcoes = await this.prisma.funcao.findMany({
      include: {
        qualificacoes: {
          where: { pessoaId: id },
        },
        ministerio: true,
      },
    });

    return funcoes.map((funcao) => ({
      funcao: funcao.nome,
      id: funcao.id,
      qualificado: funcao.qualificacoes.length > 0,
      ministerio: funcao.ministerio.nome,
      ministerioId: funcao.ministerio.id,
    }));
  }
}
