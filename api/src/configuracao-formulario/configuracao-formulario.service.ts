import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@Injectable()
export class ConfiguracaoFormularioService {
    constructor(private readonly prisma: PrismaService) { }

    async find() {
        return this.prisma.configuracaoFormulario.findUnique({ where: { id: 1 } });
    }

    async update(dto: UpdateConfiguracaoDto) {
        return this.prisma.configuracaoFormulario.upsert({
            where: { id: 1 },
            update: { diaCorte: dto.diaCorte },
            create: { id: 1, diaCorte: dto.diaCorte },
        });
    }
}
