import { Module } from '@nestjs/common';
import { CultoService } from './culto.service';
import { CultoController } from './culto.controller';

@Module({
  controllers: [CultoController],
  providers: [CultoService],
})
export class CultoModule {}
