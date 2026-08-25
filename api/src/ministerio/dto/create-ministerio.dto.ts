import { IsNotEmpty, IsString } from "class-validator"

export class CreateMinisterioDto {
            @IsString()
            @IsNotEmpty()
            nome!: string
    }
    
