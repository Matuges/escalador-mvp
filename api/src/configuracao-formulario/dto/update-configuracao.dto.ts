import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateConfiguracaoDto {
  @ApiProperty({
    description:
      'Dia do mês em que os cultos do mês seguinte deixam de aceitar alterações. ' +
      'Máximo 28 para evitar ambiguidade em meses curtos.',
    minimum: 1,
    maximum: 28,
    example: 20,
  })
  @IsInt()
  @Min(1)
  @Max(28)
  diaCorte!: number;
}