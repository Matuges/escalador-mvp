import { ApiProperty } from '@nestjs/swagger';

export class CountResultDto {
  @ApiProperty({ example: 1, description: 'Quantidade de registros afetados' })
  count!: number;
}
