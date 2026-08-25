import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PessoaService } from './pessoa.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Controller('pessoa')
export class PessoaController {
    constructor (private readonly pessoaService: PessoaService) {}

    @Post()
    async create(@Body() dto: CreatePessoaDto) {
        return this.pessoaService.create(dto)
    }

    @Get()
    async findAll(@Query('funcaoId', new ParseIntPipe({ optional: true })) funcaoId?: number) {
            return this.pessoaService.findAll(funcaoId)
    }

    @Get(':id') 
    async findUnique(@Param('id', ParseIntPipe) id: number) {
            return this.pessoaService.findUnique(id)
        }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePessoaDto) {
        return this.pessoaService.update(id, dto)
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.pessoaService.delete(id)
    }
    
    @Get(':id/disponibilidades')
    async findDisponibilidade(@Param('id', ParseIntPipe) id: number) {
        return this.pessoaService.findDisponibilidade(id)
    } 
    

}
