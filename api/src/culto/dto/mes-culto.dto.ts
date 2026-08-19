import { IsNotEmpty, IsNumber } from "class-validator"

export class MesCultoDto {
    @IsNumber()
    @IsNotEmpty()
    ano!: number

    @IsNumber()
    @IsNotEmpty()
    mes!: number
}