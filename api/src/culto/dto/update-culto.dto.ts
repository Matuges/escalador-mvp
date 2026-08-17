import { PartialType } from '@nestjs/swagger';
import { CreateCultoDto } from './create-culto.dto';

export class UpdateCultoDto extends PartialType(CreateCultoDto) {}
