import { Module } from '@nestjs/common';
import { ConfiguracaoFormularioService } from './configuracao-formulario.service';
import { ConfiguracaoFormularioController } from './configuracao-formulario.controller';

@Module({
  controllers: [ConfiguracaoFormularioController],
  providers: [ConfiguracaoFormularioService],
})
export class ConfiguracaoFormularioModule {}
