import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DayPassType, PaymentMethod } from '../../domain/enums/day-pass.enum';

export class UpdateDayPassDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsDateString()
  validDate?: string;

  @IsOptional()
  @IsEnum(DayPassType)
  type?: DayPassType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfPeople?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
