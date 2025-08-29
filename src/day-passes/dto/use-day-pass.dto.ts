import { IsString } from 'class-validator';

export class UseDayPassDto {
  @IsString()
  passId: string;
}
