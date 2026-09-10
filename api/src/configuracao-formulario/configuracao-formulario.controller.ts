import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfiguracaoFormularioService } from './configuracao-formulario.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

@ApiTags('configuracao-formulario')
@Controller('configuracao-formulario')
export class ConfiguracaoFormularioController {
  constructor(
    private readonly configuracaoFormularioService: ConfiguracaoFormularioService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retorna a configuração atual do formulário público' })
  @ApiOkResponse({ description: 'Configuração atual', schema: { example: { id: 1, diaCorte: 20 } } })
  async find() {
    return this.configuracaoFormularioService.find();
  }

  @Put()
  @ApiOperation({
    summary: 'Atualiza o dia de corte do formulário público',
    description:
      'A partir deste dia do mês, os cultos do mês seguinte deixam de aceitar alterações no formulário.',
  })
  @ApiOkResponse({ description: 'Configuração atualizada', schema: { example: { id: 1, diaCorte: 25 } } })
  async update(@Body() dto: UpdateConfiguracaoDto) {
    return this.configuracaoFormularioService.update(dto);
  }
}
