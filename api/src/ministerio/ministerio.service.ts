import { Injectable } from '@nestjs/common';
import { CreateMinisterioDto } from './dto/create-ministerio.dto';
import { UpdateMinisterioDto } from './dto/update-ministerio.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MinisterioService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateMinisterioDto) {
    return this.prisma.ministerio.create({
      data: {
        nome: dto.nome
      }
    })
  }

  async findAll() {
    return this.prisma.ministerio.findMany()
  }

   async findUnique(id: number) {
        return this.prisma.ministerio.findUnique({
            where: { id }
        })
    }

async update(id: number, dto: UpdateMinisterioDto) {
        return this.prisma.ministerio.update({
            data: {
                nome: dto.nome,
            },
            where: { id }
        })
    }

    async delete(id: number) {
        return this.prisma.ministerio.delete({
            where: { id }
        })
      }
    }

