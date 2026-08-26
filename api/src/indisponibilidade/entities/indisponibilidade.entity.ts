import { ApiProperty } from '@nestjs/swagger';

export class Indisponibilidade {
  @ApiProperty({ example: 1 })
  pessoaId!: number;

  @ApiProperty({ example: 1 })
  cultoId!: number;
}
