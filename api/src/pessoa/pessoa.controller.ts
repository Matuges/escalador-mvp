import { Body, Controller, Get, Post } from '@nestjs/common';
import { PessoaService } from './pessoa.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';

@Controller('pessoa')
export class PessoaController {
    constructor (private readonly pessoaService: PessoaService) {}

    @Post()
    create(@Body() dto: CreatePessoaDto) {

    }

    @Get()
    findAll() {

    }

    

}
