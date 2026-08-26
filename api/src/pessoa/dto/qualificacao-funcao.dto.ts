import { ApiProperty } from '@nestjs/swagger';

export class QualificacaoFuncaoDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Vocal' })
  funcao!: string;

  @ApiProperty({ example: 'Louvor' })
  ministerio!: string;

  @ApiProperty({ example: 1 })
  ministerioId!: number;

  @ApiProperty({
    example: true,
    description: 'true se a pessoa tem qualificação registrada para a função',
  })
  qualificado!: boolean;
}
