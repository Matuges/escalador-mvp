import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
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
    async findAll() {
            return this.pessoaService.findAll()
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
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.pessoaService.remove(id)
    }
    

    

}
