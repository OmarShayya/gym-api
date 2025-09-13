import { IsNotEmpty, IsString } from 'class-validator';

export class UseDayPassDto {
  @IsNotEmpty()
  @IsString()
  passId: string;
}
