import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FuncaoService } from './funcao.service';
import { CreateFuncaoDto } from './dto/create-funcao.dto';
import { UpdateFuncaoDto } from './dto/update-funcao.dto';
import { Funcao } from './entities/funcao.entity';

@ApiTags('funcao')
@Controller()
export class FuncaoController {
  constructor(private readonly funcaoService: FuncaoService) {}

  @Post('ministerio/:ministerioId/funcao')
  @ApiOperation({ summary: 'Cria uma função dentro de um ministério' })
  @ApiParam({ name: 'ministerioId', type: Number })
  @ApiCreatedResponse({ type: Funcao })
  create(
    @Param('ministerioId', ParseIntPipe) ministerioId: number,
    @Body() dto: CreateFuncaoDto,
  ) {
    return this.funcaoService.create(ministerioId, dto);
  }

  @Get('ministerio/:ministerioId/funcao')
  @ApiOperation({ summary: 'Lista as funções de um ministério' })
  @ApiParam({ name: 'ministerioId', type: Number })
  @ApiOkResponse({ type: Funcao, isArray: true })
  findAll(@Param('ministerioId', ParseIntPipe) ministerioId: number) {
    return this.funcaoService.findAllByMinisterio(ministerioId);
  }

  @Get('funcao/:id')
  @ApiOperation({ summary: 'Busca uma função pelo id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Funcao })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funcaoService.findUnique(id);
  }

  @Patch('funcao/:id')
  @ApiOperation({ summary: 'Atualiza uma função' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Funcao })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFuncaoDto) {
    return this.funcaoService.update(id, dto);
  }

  @Delete('funcao/:id')
  @ApiOperation({ summary: 'Remove uma função' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Funcao })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.funcaoService.delete(id);
  }
}
