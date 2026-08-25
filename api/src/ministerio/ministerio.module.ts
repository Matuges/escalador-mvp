import { Module } from '@nestjs/common';
import { MinisterioService } from './ministerio.service';
import { MinisterioController } from './ministerio.controller';

@Module({
  controllers: [MinisterioController],
  providers: [MinisterioService],
})
export class MinisterioModule {}
