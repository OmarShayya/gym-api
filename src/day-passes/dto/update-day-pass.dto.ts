import { PartialType } from '@nestjs/mapped-types';
import { CreateDayPassDto } from './create-day-pass.dto';

export class UpdateDayPassDto extends PartialType(CreateDayPassDto) {}
