import { Module } from '@nestjs/common';
import { FuncaoService } from './funcao.service';
import { FuncaoController } from './funcao.controller';

@Module({
  controllers: [FuncaoController],
  providers: [FuncaoService],
})
export class FuncaoModule {}
