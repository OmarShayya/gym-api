import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  MinLength,
  Matches,
  IsEnum,
  IsPhoneNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  MembershipType,
  MemberStatus,
} from '../../domain/enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';

class EmergencyContactDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @IsNotEmpty()
  @IsString()
  relationship: string;
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

export class CreateMemberDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name can only contain letters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Last name can only contain letters' })
  lastName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @IsNotEmpty({ message: 'Membership start date is required' })
  @IsDateString({}, { message: 'Please provide a valid date' })
  membershipStartDate: string;

  @IsNotEmpty({ message: 'Membership end date is required' })
  @IsDateString({}, { message: 'Please provide a valid date' })
  membershipEndDate: string;

  @IsOptional()
  @IsEnum(MembershipType)
  membershipType?: MembershipType;

  @IsOptional()
  @IsString()
  fingerprintId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

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
