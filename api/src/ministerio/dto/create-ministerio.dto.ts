import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMinisterioDto {
  @ApiProperty({ example: 'Louvor' })
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
