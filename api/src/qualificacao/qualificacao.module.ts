import { Module } from '@nestjs/common';
import { QualificacaoService } from './qualificacao.service';
import { QualificacaoController } from './qualificacao.controller';

@Module({
  controllers: [QualificacaoController],
  providers: [QualificacaoService],
})
export class QualificacaoModule {}
