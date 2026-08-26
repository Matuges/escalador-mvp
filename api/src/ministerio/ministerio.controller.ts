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
import { MinisterioService } from './ministerio.service';
import { CreateMinisterioDto } from './dto/create-ministerio.dto';
import { UpdateMinisterioDto } from './dto/update-ministerio.dto';
import { Ministerio } from './entities/ministerio.entity';

@ApiTags('ministerio')
@Controller('ministerio')
export class MinisterioController {
  constructor(private readonly ministerioService: MinisterioService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um ministério' })
  @ApiCreatedResponse({ type: Ministerio })
  create(@Body() dto: CreateMinisterioDto) {
    return this.ministerioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os ministérios' })
  @ApiOkResponse({ type: Ministerio, isArray: true })
  findAll() {
    return this.ministerioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um ministério pelo id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Ministerio })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ministerioService.findUnique(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um ministério' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Ministerio })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMinisterioDto,
  ) {
    return this.ministerioService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um ministério' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: Ministerio })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ministerioService.delete(id);
  }
}
