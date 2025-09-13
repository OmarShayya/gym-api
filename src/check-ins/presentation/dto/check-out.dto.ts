import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckOutDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
