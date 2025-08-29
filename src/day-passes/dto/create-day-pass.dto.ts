// src/day-passes/dto/create-day-pass.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateDayPassDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsDateString()
  validDate: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
