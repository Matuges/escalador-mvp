import { Module } from '@nestjs/common';
import { PessoaService } from './pessoa.service';
import { PessoaController } from './pessoa.controller';
import { IndisponibilidadeModule } from '../indisponibilidade/indisponibilidade.module';

@Module({
  imports: [IndisponibilidadeModule],
  providers: [PessoaService],
  controllers: [PessoaController],
})
export class PessoaModule {}
