import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCultoDto } from './dto/create-culto.dto';
import { UpdateCultoDto } from './dto/update-culto.dto';

@Injectable()
export class CultoService {
    constructor(private readonly prisma: PrismaService) { }

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

    gerarCultosDoMes(ano: number, mes: number) {
        const diasNoMes = new Date(ano, mes, 0).getDate()
        let cultos: { nome: string; data: Date }[] = []
        let sabado = 0

        for (let dia = 1; dia <= diasNoMes; dia++) {
            const data = new Date(ano, mes - 1, dia)
            const diaDaSemana = data.getDay()
            if (diaDaSemana === 0) {
                cultos.push({
                    nome: "Culto de domingo a manhã",
                    data: data
                },
                    {
                        nome: "Culto de domingo de noite",
                        data: data
                    }
                )
            }
            if (diaDaSemana === 2) {
                cultos.push({
                    nome: "Culto de terça",
                    data: data
                },
                )
            }

            if (diaDaSemana === 6) {
                sabado++
                if (sabado === 1 || sabado === 3) {
                    cultos.push({ nome: "Culto de consagração", data: data })
                }
            }

        }

        return cultos
    }

}


