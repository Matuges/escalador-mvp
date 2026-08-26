import { ApiProperty } from '@nestjs/swagger';

export class Funcao {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Vocalista' })
  nome!: string;

  @ApiProperty({
    example: 1,
    description: 'Id do ministério ao qual a função pertence',
  })
  ministerioId!: number;
}
