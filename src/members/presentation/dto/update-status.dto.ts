import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { MemberStatus } from '../../domain/enums/member-status.enum';

export class UpdateMemberStatusDto {
  @IsNotEmpty()
  @IsEnum(MemberStatus)
  status: MemberStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
