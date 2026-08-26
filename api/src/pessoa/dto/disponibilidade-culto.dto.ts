import { ApiProperty } from '@nestjs/swagger';

export class DisponibilidadeCultoDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Culto de domingo à noite' })
  culto!: string;

  @ApiProperty({ example: '2026-08-30T20:00:00.000Z' })
  data!: Date;

  @ApiProperty({
    example: true,
    description:
      'true se a pessoa não tem indisponibilidade registrada para o culto',
  })
  disponivel!: boolean;
}
