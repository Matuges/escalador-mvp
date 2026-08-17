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
                nome: dto.nome
            }
        }
        )
    }

    async findAll() {
        return this.prisma.pessoa.findMany()
    }

    async findUnique(id: number) {
        return this.prisma.pessoa.findUnique({
            where: {
                id: id
            }
        })
    }

    async update(id: number, dto: UpdatePessoaDto) {
        return this.prisma.pessoa.update({
            data: {
                nome: dto.nome
            },
            where: {
                id: id
            }
        })
    }

    async delete(id: number) {
        return this.prisma.pessoa.delete({
            where: {
                id: id
            }
        })
    }

    async findDisponibilidade(id: number) {
        const cultos = await this.prisma.culto.findMany({
            include: {
                indisponibilidades: {
                    where: {pessoaId: id}
                }
            }      
        })

        return (cultos).map((culto) => ({
            culto: culto.nome,
            id: culto.id,
            data: culto.data,
            disponivel: culto.indisponibilidades.length === 0 
        }))
    }
}

