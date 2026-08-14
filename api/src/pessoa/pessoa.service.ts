import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';

@Injectable()
export class PessoaService {
    constructor(private readonly prisma: PrismaService) {}

    create(dto: CreatePessoaDto) {
        this.prisma.pessoa.create(
            
        )
    }

    findAll() {
        
    }
}
