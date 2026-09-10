import { IsInt, Max, Min } from "class-validator";


export class UpdateConfiguracaoDto {
  @IsInt() @Min(1) @Max(28)         // 28 evita ambiguidade em meses curtos
  diaCorte?: number;
}