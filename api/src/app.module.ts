import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PessoaModule } from './pessoa/pessoa.module';
import { IndisponibilidadeModule } from './indisponibilidade/indisponibilidade.module';

@Module({
  imports: [PrismaModule, PessoaModule, IndisponibilidadeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
