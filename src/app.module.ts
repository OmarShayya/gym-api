import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { DayPassesModule } from './day-passes/day-passes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost/gym-management',
    ),
    AuthModule,
    MembersModule,
    CheckInsModule,
    ProductsModule,
    SalesModule,
    DayPassesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
