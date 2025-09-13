import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
  ValidateNested,
  IsObject,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  MembershipType,
  MemberStatus,
} from '../../domain/enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';

class EmergencyContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber(null)
  phone?: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}

class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name can only contain letters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Last name can only contain letters' })
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date' })
  membershipStartDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date' })
  membershipEndDate?: string;

  @IsOptional()
  @IsEnum(MembershipType)
  membershipType?: MembershipType;

  @IsOptional()
  @IsString()
  fingerprintId?: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
