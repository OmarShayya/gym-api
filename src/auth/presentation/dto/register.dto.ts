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
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../domain/enums/user-role.enum';

export class RegisterDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name can only contain letters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
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
  @IsString({ message: 'Password must be a string' })
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
  @IsString()
  fingerprintId?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole;
}
