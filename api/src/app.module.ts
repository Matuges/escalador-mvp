import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PessoaModule } from './pessoa/pessoa.module';
import { IndisponibilidadeModule } from './indisponibilidade/indisponibilidade.module';
import { CultoModule } from './culto/culto.module';
import { QualificacaoModule } from './qualificacao/qualificacao.module';
import { MinisterioModule } from './ministerio/ministerio.module';
import { FuncaoModule } from './funcao/funcao.module';

@Module({
  imports: [
    PrismaModule,
    PessoaModule,
    IndisponibilidadeModule,
    CultoModule,
    QualificacaoModule,
    MinisterioModule,
    FuncaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
