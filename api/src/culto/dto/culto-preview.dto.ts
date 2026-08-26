import { ApiProperty } from '@nestjs/swagger';

export class CultoPreviewDto {
  @ApiProperty({ example: 'Culto de domingo à manhã' })
  nome!: string;

  @ApiProperty({ example: '2026-08-30T00:00:00.000Z' })
  data!: Date;
}
