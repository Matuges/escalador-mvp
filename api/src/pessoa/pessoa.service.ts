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
        const cultos = this.prisma.culto.findMany({
            include: {
                indisponibilidades: {
                    where: {pessoaId: id}
                }
            }      
        })

    }
}

/* A estrutura geral fica assim:

const cultos = await this.prisma.culto.findMany({
  include: { indisponibilidades: { where: { pessoaId: id } } }
})

return cultos.map((culto) => ({
  // ...os campos do culto que você quer expor (id, nome, data)
  disponivel: /* alguma expressão booleana usando culto.indisponibilidades 
}))

Dentro do callback, culto é um objeto com id, nome, data (os campos normais de Culto) e indisponibilidades (o array filtrado). Você monta o objeto de retorno escolhendo os campos que interessam e calculando disponivel a partir do tamanho desse array (lembra: vazio = disponível).

Tenta preencher os campos e a expressão de disponivel você mesma — já te dei a peça que faltava (o formato do .map() em cima do resultado do include).
*/