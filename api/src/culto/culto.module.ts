import { Module } from '@nestjs/common';
import { CultoService } from './culto.service';
import { CultoController } from './culto.controller';
import { IndisponibilidadeModule } from '../indisponibilidade/indisponibilidade.module';

@Module({
  imports: [IndisponibilidadeModule],
  controllers: [CultoController],
  providers: [CultoService],
})
export class CultoModule {}
