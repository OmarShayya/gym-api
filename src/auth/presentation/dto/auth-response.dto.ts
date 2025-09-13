import { IsNotEmpty, IsString, IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
  @IsJWT({ message: 'Invalid refresh token format' })
  refreshToken: string;
}
