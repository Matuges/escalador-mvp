import { PartialType } from '@nestjs/swagger';
import { CreateFuncaoDto } from './create-funcao.dto';

export class UpdateFuncaoDto extends PartialType(CreateFuncaoDto) {}
