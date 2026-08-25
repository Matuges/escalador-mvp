import { IsNotEmpty, IsString } from "class-validator"

export class CreateFuncaoDto {
    @IsString()
    @IsNotEmpty()
    nome!: string
}
