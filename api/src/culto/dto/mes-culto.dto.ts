import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MesCultoDto {
  @ApiProperty({ example: 2026 })
  @IsNumber()
  @IsNotEmpty()
  ano!: number;

  @ApiProperty({
    example: 8,
    description: 'Mês de 1 (janeiro) a 12 (dezembro)',
  })
  @IsNumber()
  @IsNotEmpty()
  mes!: number;
}
