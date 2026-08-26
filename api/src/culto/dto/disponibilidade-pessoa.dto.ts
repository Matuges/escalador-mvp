import { ApiProperty } from '@nestjs/swagger';

export class DisponibilidadePessoaDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Maria Silva' })
  pessoa!: string;

  @ApiProperty({
    example: true,
    description:
      'true se a pessoa não tem indisponibilidade registrada para o culto',
  })
  disponivel!: boolean;
}
