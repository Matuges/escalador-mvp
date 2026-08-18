import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateCultoDto {
        @IsString()
        @IsNotEmpty()
        nome!: string

        @IsDateString()
        @IsNotEmpty()
        data!: string
}
