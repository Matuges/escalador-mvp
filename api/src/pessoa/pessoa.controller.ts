import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PessoaService } from './pessoa.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { Pessoa } from './entities/pessoa.entity';
import { DisponibilidadeCultoDto } from './dto/disponibilidade-culto.dto';
import { QualificacaoFuncaoDto } from './dto/qualificacao-funcao.dto';

@ApiTags('pessoa')
@Controller('pessoa')
export class PessoaController {
  constructor(private readonly pessoaService: PessoaService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma pessoa' })
  @ApiCreatedResponse({ type: Pessoa })
  async create(@Body() dto: CreatePessoaDto) {
    return this.pessoaService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista pessoas, opcionalmente filtradas por função',
  })
  @ApiQuery({
    name: 'funcaoId',
    required: false,
    type: Number,
    description: 'Filtra só pessoas qualificadas para essa função',
  })
  @ApiOkResponse({ type: Pessoa, isArray: true })
  async findAll(
    @Query('funcaoId', new ParseIntPipe({ optional: true })) funcaoId?: number,
  ) {
    return this.pessoaService.findAll(funcaoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma pessoa pelo id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Pessoa })
  async findUnique(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.findUnique(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma pessoa' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Pessoa })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePessoaDto,
  ) {
    return this.pessoaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma pessoa' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Pessoa })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.delete(id);
  }

  @Get(':id/disponibilidades')
  @ApiOperation({
    summary: 'Lista, para cada culto, se a pessoa está disponível para servir',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: DisponibilidadeCultoDto, isArray: true })
  async findDisponibilidade(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.findDisponibilidade(id);
  }

  @Get(':id/qualificacoes')
  @ApiOperation({
    summary:
      'Lista, para cada função, se a pessoa está qualificada para exercê-la',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: QualificacaoFuncaoDto, isArray: true })
  async findQualificacao(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.findQualificacao(id);
  }
}
