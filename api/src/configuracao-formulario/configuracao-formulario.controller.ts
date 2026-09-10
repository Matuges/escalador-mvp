import { Controller } from '@nestjs/common';
import { ConfiguracaoFormularioService } from './configuracao-formulario.service';

@Controller('configuracao-formulario')
export class ConfiguracaoFormularioController {
  constructor(private readonly configuracaoFormularioService: ConfiguracaoFormularioService) {}
}
