import { Module } from '@nestjs/common';
import { IndisponibilidadeService } from './indisponibilidade.service';
import { IndisponibilidadeController } from './indisponibilidade.controller';

@Module({
  controllers: [IndisponibilidadeController],
  providers: [IndisponibilidadeService],
  exports: [IndisponibilidadeService],
})
export class IndisponibilidadeModule {}
