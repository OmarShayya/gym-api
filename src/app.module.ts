import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { appConfig, databaseConfig, jwtConfig } from './config';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/infrastructure/guards/jwt-auth.guard';
import { CheckInsModule } from './check-ins/check-ins.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DayPassesModule } from './day-passes/day-passes.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { MembersModule } from './members/members.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        ...configService.get('database.options'),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
          });
          connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('app.rateLimit.ttl', 60),
          limit: configService.get<number>('app.rateLimit.limit', 100),
        },
      ],
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    MembersModule,
    CheckInsModule,
    ProductsModule,
    SalesModule,
    DayPassesModule,
    FileStorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
