import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateCultoDto {
  @ApiProperty({ example: 'Culto de domingo à noite' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: '2026-08-30T20:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  data!: string;
}
