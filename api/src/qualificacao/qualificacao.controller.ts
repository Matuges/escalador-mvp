import { Controller, Delete, Param, ParseIntPipe, Put } from '@nestjs/common';
import { QualificacaoService } from './qualificacao.service';

@Controller('pessoa/:pessoaId/qualificacao')
export class QualificacaoController {
  constructor(private readonly qualificacaoService: QualificacaoService) { }

  @Put(':funcaoId')
  async setQualificacao(@Param('pessoaId', ParseIntPipe) pessoaId: number, @Param('funcaoId', ParseIntPipe) funcaoId: number) {
    return this.qualificacaoService.setQualificacao(pessoaId, funcaoId)
  }

  @Delete(':funcaoId')
  async removeQualificacao(@Param('pessoaId', ParseIntPipe) pessoaId: number, @Param('funcaoId', ParseIntPipe) funcaoId: number) {
    return this.qualificacaoService.removeQualificacao(pessoaId, funcaoId)
  }

}


