import { Injectable } from '@nestjs/common';
import { CreateFuncaoDto } from './dto/create-funcao.dto';
import { UpdateFuncaoDto } from './dto/update-funcao.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FuncaoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ministerioId: number, dto: CreateFuncaoDto) {
    return this.prisma.funcao.create({
      data: {
        nome: dto.nome,
        ministerioId,
      },
    });
  }

  async findAllByMinisterio(ministerioId: number) {
    return this.prisma.funcao.findMany({
      where: { ministerioId },
    });
  }

  async findUnique(id: number) {
    return this.prisma.funcao.findUnique({
      where: { id },
    });
  }

  async update(id: number, dto: UpdateFuncaoDto) {
    return this.prisma.funcao.update({
      data: {
        nome: dto.nome,
      },
      where: { id },
    });
  }

  async delete(id: number) {
    return this.prisma.funcao.delete({
      where: { id },
    });
  }
}
