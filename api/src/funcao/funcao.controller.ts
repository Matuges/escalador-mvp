import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FuncaoService } from './funcao.service';
import { CreateFuncaoDto } from './dto/create-funcao.dto';
import { UpdateFuncaoDto } from './dto/update-funcao.dto';

@Controller()
export class FuncaoController {
  constructor(private readonly funcaoService: FuncaoService) {}

  @Post('ministerio/:ministerioId/funcao')
  create(@Param('ministerioId', ParseIntPipe) ministerioId: number, @Body() dto: CreateFuncaoDto) {
    return this.funcaoService.create(ministerioId, dto);
  }

  @Get('ministerio/:ministerioId/funcao')
  findAll(@Param('ministerioId', ParseIntPipe) ministerioId: number) {
    return this.funcaoService.findAllByMinisterio(ministerioId);
  }

  @Get('funcao/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funcaoService.findUnique(id);
  }

  @Patch('funcao/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFuncaoDto) {
    return this.funcaoService.update(id, dto);
  }

  @Delete('funcao/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.funcaoService.delete(id);
  }
}
