import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  membershipStartDate?: string;

  @IsOptional()
  @IsDateString()
  membershipEndDate?: string;

  @IsOptional()
  @IsString()
  fingerprintId?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsEnum(['member', 'admin'])
  role?: string;
}
