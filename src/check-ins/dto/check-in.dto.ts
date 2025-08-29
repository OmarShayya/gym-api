import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum CheckInMethod {
  QR = 'qr',
  FINGERPRINT = 'fingerprint',
  MANUAL = 'manual',
}

export class CheckInDto {
  @IsNotEmpty()
  @IsString()
  memberId: string;

  @IsNotEmpty()
  @IsEnum(CheckInMethod)
  method: CheckInMethod;
}

export class CheckOutDto {
  @IsNotEmpty()
  @IsString()
  memberId: string;
}
