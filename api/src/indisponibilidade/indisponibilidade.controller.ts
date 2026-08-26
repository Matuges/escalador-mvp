import { Controller, Delete, Param, ParseIntPipe, Put } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IndisponibilidadeService } from './indisponibilidade.service';
import { Indisponibilidade } from './entities/indisponibilidade.entity';
import { CountResultDto } from '../common/dto/count-result.dto';

@ApiTags('indisponibilidade')
@Controller('pessoa/:pessoaId/indisponibilidade')
export class IndisponibilidadeController {
  constructor(
    private readonly indisponibilidadeService: IndisponibilidadeService,
  ) {}

  @Put(':cultoId')
  @ApiOperation({
    summary: 'Marca a pessoa como indisponível para o culto (idempotente)',
  })
  @ApiParam({ name: 'pessoaId', type: Number })
  @ApiParam({ name: 'cultoId', type: Number })
  @ApiOkResponse({ type: Indisponibilidade })
  async setIndisponibilidade(
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
    @Param('cultoId', ParseIntPipe) cultoId: number,
  ) {
    return this.indisponibilidadeService.setIndisponibilidade(
      pessoaId,
      cultoId,
    );
  }

  @Delete(':cultoId')
  @ApiOperation({
    summary: 'Remove a indisponibilidade da pessoa para o culto (idempotente)',
  })
  @ApiParam({ name: 'pessoaId', type: Number })
  @ApiParam({ name: 'cultoId', type: Number })
  @ApiOkResponse({ type: CountResultDto })
  async removeIndisponibilidade(
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
    @Param('cultoId', ParseIntPipe) cultoId: number,
  ) {
    return this.indisponibilidadeService.removeIndisponibilidade(
      pessoaId,
      cultoId,
    );
  }
}
