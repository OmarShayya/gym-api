import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { CheckInMethod } from '../../domain/enums/check-in.enum';

export class DayPassCheckInDto {
  @IsNotEmpty()
  @IsString()
  passId: string;

  @IsNotEmpty()
  @IsEnum(CheckInMethod)
  method: CheckInMethod;

  @IsOptional()
  @IsString()
  location?: string;
}
