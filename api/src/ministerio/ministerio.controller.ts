import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MinisterioService } from './ministerio.service';
import { CreateMinisterioDto } from './dto/create-ministerio.dto';
import { UpdateMinisterioDto } from './dto/update-ministerio.dto';

@Controller('ministerio')
export class MinisterioController {
  constructor(private readonly ministerioService: MinisterioService) {}

  @Post()
  create(@Body() dto: CreateMinisterioDto) {
    return this.ministerioService.create(dto);
  }

  @Get()
  findAll() {
    return this.ministerioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ministerioService.findUnique(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMinisterioDto) {
    return this.ministerioService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ministerioService.delete(id);
  }
}
