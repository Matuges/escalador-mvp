import { PartialType } from '@nestjs/swagger';
import { CreateMinisterioDto } from './create-ministerio.dto';

export class UpdateMinisterioDto extends PartialType(CreateMinisterioDto) {}
