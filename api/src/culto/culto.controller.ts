import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CultoService } from './culto.service';
import { CreateCultoDto } from './dto/create-culto.dto';
import { UpdateCultoDto } from './dto/update-culto.dto';
import { MesCultoDto } from './dto/mes-culto.dto';

@Controller('culto')
export class CultoController {
    constructor(private readonly cultoService: CultoService) { }

    @Post()
    async create(@Body() dto: CreateCultoDto) {
        return this.cultoService.create(dto)
    }

    @Get()
    async findAll() {
        return this.cultoService.findAll()
    }

    @Post('mes')
    salvarCultosDoMes(@Body() dto: MesCultoDto) {
        return this.cultoService.salvarCultosDoMes(dto.ano, dto.mes)
    }

    @Get('mes')
    gerarCultosDoMes(@Query('ano', ParseIntPipe) ano: number, @Query('mes') mes: number) {
        return this.cultoService.gerarCultosDoMes(ano, mes)
    }

    @Get(':id')
    async findUnique(@Param('id', ParseIntPipe) id: number) {
        return this.cultoService.findUnique(id)
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCultoDto) {
        return this.cultoService.update(id, dto)
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.cultoService.delete(id)
    }


}
