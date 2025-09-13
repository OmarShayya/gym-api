import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './presentation/controllers/auth.controller';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';

import { TokenService } from './application/services/token.service';
import { AuthService } from './application/services/auth.service';
import { AuthEmailService } from './application/services/auth-email.service';

import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtRefreshGuard } from './infrastructure/guards/jwt-refresh.guard';
import { LocalAuthGuard } from './infrastructure/guards/local-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    MembersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET', 'access_secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRY', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,

    TokenService,
    AuthService,
    AuthEmailService,

    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,

    JwtAuthGuard,
    JwtRefreshGuard,
    LocalAuthGuard,
    RolesGuard,
  ],
  exports: [
    JwtAuthGuard,
    JwtRefreshGuard,
    RolesGuard,
    TokenService,
    AuthService,
  ],
})
export class AuthModule {}
