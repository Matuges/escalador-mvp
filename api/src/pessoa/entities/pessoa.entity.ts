import { ApiProperty } from '@nestjs/swagger';

export class Pessoa {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Maria Silva' })
  nome!: string;
}
