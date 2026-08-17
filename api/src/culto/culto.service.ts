import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCultoDto } from './dto/create-culto.dto';
import { UpdateCultoDto } from './dto/update-culto.dto';

@Injectable()
export class CultoService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateCultoDto) {
        return this.prisma.culto.create({
            data: {
                nome: dto.nome,
                data: dto.data
            }
        })
    }

    async findAll() {
        return this.prisma.culto.findMany()
    }

    async findUnique(id: number) {
        return this.prisma.culto.findUnique({
            where: { id }
        })
    }

    async update(id: number, dto: UpdateCultoDto) {
        return this.prisma.culto.update({
            data: {
                nome: dto.nome,
                data: dto.data
            },
            where: { id }
        })
    }

    async delete(id: number) {
        return this.prisma.culto.delete({
            where: { id }
        })
    }
}
