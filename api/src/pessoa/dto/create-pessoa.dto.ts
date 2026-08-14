import { IsNotEmpty, IsString } from "class-validator";

export class CreatePessoaDto {
    
    @IsString()
    @IsNotEmpty()
    nome!: string
}