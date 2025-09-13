import { Controller, Get, Version } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from './auth/infrastructure/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Get()
  getHello() {
    return {
      message: 'Gym Management API is running!',
      version: this.configService.get<string>('app.appVersion'),
      environment: this.configService.get<string>('app.nodeEnv'),
    };
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Public()
  @Version('1')
  @Get('info')
  getInfo() {
    return {
      name: this.configService.get<string>('app.appName'),
      version: this.configService.get<string>('app.appVersion'),
      environment: this.configService.get<string>('app.nodeEnv'),
      apiVersion: 'v1',
      documentation: '/api/docs',
    };
  }
}
