import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MinisterioService } from './ministerio.service';
import { CreateMinisterioDto } from './dto/create-ministerio.dto';
import { UpdateMinisterioDto } from './dto/update-ministerio.dto';

@Controller('ministerio')
export class MinisterioController {
  constructor(private readonly ministerioService: MinisterioService) {}

  @Post()
  create(@Body() createMinisterioDto: CreateMinisterioDto) {
    return this.ministerioService.create(createMinisterioDto);
  }

  @Get()
  findAll() {
    return this.ministerioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ministerioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMinisterioDto: UpdateMinisterioDto) {
    return this.ministerioService.update(+id, updateMinisterioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ministerioService.remove(+id);
  }
}
