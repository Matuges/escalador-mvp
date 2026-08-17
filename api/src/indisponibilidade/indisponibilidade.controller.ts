import { Controller, Delete, Param, ParseIntPipe, Put } from '@nestjs/common';
import { IndisponibilidadeService } from './indisponibilidade.service';

@Controller('pessoa/:pessoaId/indisponibilidade')
export class IndisponibilidadeController {
  constructor(private readonly indisponibilidadeService: IndisponibilidadeService) {}

    @Put(':cultoId')
    async setIndisponibilidade(@Param('pessoaId', ParseIntPipe) pessoaId: number, @Param('cultoId', ParseIntPipe) cultoId: number) {
      return this.indisponibilidadeService.setIndisponibilidade(pessoaId, cultoId)
    }
    
    @Delete(':cultoId')
    async removeIndisponibilidade(@Param('pessoaId', ParseIntPipe) pessoaId: number, @Param('cultoId', ParseIntPipe) cultoId: number) {
      return this.indisponibilidadeService.removeIndisponibilidade(pessoaId, cultoId)
    }
  
}
