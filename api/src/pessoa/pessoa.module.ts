import { Module } from '@nestjs/common';
import { PessoaService } from './pessoa.service';
import { PessoaController } from './pessoa.controller';

@Module({
  providers: [PessoaService],
  controllers: [PessoaController]
})
export class PessoaModule {}
