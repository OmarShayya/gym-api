import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Version,
} from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { UserRole } from '../../domain/enums/user-role.enum';
import { IAuthUser } from '../../domain/interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Version('1')
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Version('1')
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.registerUseCase.execute(registerDto);
  }

  @Version('1')
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  @Version('1')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string) {
    return this.logoutUseCase.execute(userId);
  }

  @Version('1')
  @Get('profile')
  async getProfile(@CurrentUser() user: IAuthUser) {
    return { user };
  }

  @Version('1')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('register-staff')
  @HttpCode(HttpStatus.CREATED)
  async registerStaff(@Body() registerDto: RegisterDto) {
    registerDto.role = UserRole.STAFF;
    return this.registerUseCase.execute(registerDto);
  }

  @Version('1')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('register-admin')
  @HttpCode(HttpStatus.CREATED)
  async registerAdmin(@Body() registerDto: RegisterDto) {
    registerDto.role = UserRole.ADMIN;
    return this.registerUseCase.execute(registerDto);
  }

  @Version('1')
  @Get('validate')
  async validateToken(@CurrentUser() user: IAuthUser) {
    return {
      valid: true,
      user,
    };
  }
}
