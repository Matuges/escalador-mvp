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
import { CultoService } from './culto.service';
import { CreateCultoDto } from './dto/create-culto.dto';
import { UpdateCultoDto } from './dto/update-culto.dto';
import { MesCultoDto } from './dto/mes-culto.dto';
import { Culto } from './entities/culto.entity';
import { CultoPreviewDto } from './dto/culto-preview.dto';
import { CountResultDto } from '../common/dto/count-result.dto';
import { DisponibilidadePessoaDto } from './dto/disponibilidade-pessoa.dto';

@ApiTags('culto')
@Controller('culto')
export class CultoController {
  constructor(private readonly cultoService: CultoService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um culto' })
  @ApiCreatedResponse({ type: Culto })
  async create(@Body() dto: CreateCultoDto) {
    return this.cultoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os cultos' })
  @ApiOkResponse({ type: Culto, isArray: true })
  async findAll() {
    return this.cultoService.findAll();
  }

  @Post('mes')
  @ApiOperation({
    summary:
      'Gera e salva os cultos recorrentes (domingo, terça e sábados de consagração) de um mês/ano',
  })
  @ApiCreatedResponse({ type: CountResultDto })
  salvarCultosDoMes(@Body() dto: MesCultoDto) {
    return this.cultoService.salvarCultosDoMes(dto.ano, dto.mes);
  }

  @Get('mes')
  @ApiOperation({
    summary: 'Pré-visualiza os cultos recorrentes de um mês/ano, sem salvar',
  })
  @ApiQuery({ name: 'ano', type: Number, example: 2026 })
  @ApiQuery({
    name: 'mes',
    type: Number,
    example: 8,
    description: 'Mês de 1 (janeiro) a 12 (dezembro)',
  })
  @ApiOkResponse({ type: CultoPreviewDto, isArray: true })
  gerarCultosDoMes(
    @Query('ano', ParseIntPipe) ano: number,
    @Query('mes') mes: number,
  ) {
    return this.cultoService.gerarCultosDoMes(ano, mes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um culto pelo id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Culto })
  async findUnique(@Param('id', ParseIntPipe) id: number) {
    return this.cultoService.findUnique(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um culto' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Culto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCultoDto,
  ) {
    return this.cultoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um culto' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Culto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.cultoService.delete(id);
  }

  @Get(':id/disponibilidades')
  @ApiOperation({
    summary:
      'Lista, para cada pessoa (opcionalmente filtrada por função), se ela está disponível para servir nesse culto',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({
    name: 'funcaoId',
    required: false,
    type: Number,
    description: 'Filtra só pessoas qualificadas para essa função',
  })
  @ApiOkResponse({ type: DisponibilidadePessoaDto, isArray: true })
  async findDisponibilidade(
    @Param('id', ParseIntPipe) id: number,
    @Query('funcaoId', new ParseIntPipe({ optional: true })) funcaoId?: number,
  ) {
    return this.cultoService.findDisponibilidade(id, funcaoId);
  }
}
