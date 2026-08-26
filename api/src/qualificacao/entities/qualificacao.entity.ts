import { ApiProperty } from '@nestjs/swagger';

export class Qualificacao {
  @ApiProperty({ example: 1 })
  pessoaId!: number;

  @ApiProperty({ example: 1 })
  funcaoId!: number;
}
