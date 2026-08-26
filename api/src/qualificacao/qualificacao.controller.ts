import { Controller, Delete, Param, ParseIntPipe, Put } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { QualificacaoService } from './qualificacao.service';
import { Qualificacao } from './entities/qualificacao.entity';
import { CountResultDto } from '../common/dto/count-result.dto';

@ApiTags('qualificacao')
@Controller('pessoa/:pessoaId/qualificacao')
export class QualificacaoController {
  constructor(private readonly qualificacaoService: QualificacaoService) {}

  @Put(':funcaoId')
  @ApiOperation({
    summary: 'Marca a pessoa como qualificada para a função (idempotente)',
  })
  @ApiParam({ name: 'pessoaId', type: Number })
  @ApiParam({ name: 'funcaoId', type: Number })
  @ApiOkResponse({ type: Qualificacao })
  async setQualificacao(
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
    @Param('funcaoId', ParseIntPipe) funcaoId: number,
  ) {
    return this.qualificacaoService.setQualificacao(pessoaId, funcaoId);
  }

  @Delete(':funcaoId')
  @ApiOperation({
    summary: 'Remove a qualificação da pessoa para a função (idempotente)',
  })
  @ApiParam({ name: 'pessoaId', type: Number })
  @ApiParam({ name: 'funcaoId', type: Number })
  @ApiOkResponse({ type: CountResultDto })
  async removeQualificacao(
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
    @Param('funcaoId', ParseIntPipe) funcaoId: number,
  ) {
    return this.qualificacaoService.removeQualificacao(pessoaId, funcaoId);
  }
}
