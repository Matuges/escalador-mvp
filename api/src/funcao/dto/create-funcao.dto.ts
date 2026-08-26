import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFuncaoDto {
  @ApiProperty({ example: 'Vocalista' })
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
