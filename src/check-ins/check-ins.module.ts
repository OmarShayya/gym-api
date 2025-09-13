import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import {
  CheckIn,
  CheckInSchema,
} from './infrastructure/schemas/check-in.schema';
import { CheckInRepository } from './infrastructure/repositories/check-in.repository';
import { CheckInMapper } from './infrastructure/mappers/check-in.mapper';

import { CheckInsController } from './presentation/controllers/check-ins.controller';

import { CheckInValidationService } from './application/services/check-in-validation.service';
import { AutoCheckoutService } from './application/services/auto-checkout.service';

import { CheckInUseCase } from './application/use-cases/check-in.use-case';
import { DayPassCheckInUseCase } from './application/use-cases/day-pass-check-in.use-case';
import { QrCheckInUseCase } from './application/use-cases/qr-check-in.use-case';
import { CheckOutUseCase } from './application/use-cases/check-out.use-case';
import { GetCheckInsUseCase } from './application/use-cases/get-check-ins.use-case';

import { MembersModule } from '../members/members.module';
import { DayPassesModule } from '../day-passes/day-passes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CheckIn.name, schema: CheckInSchema }]),
    ScheduleModule.forRoot(),
    MembersModule,
    DayPassesModule,
  ],
  controllers: [CheckInsController],
  providers: [
    CheckInRepository,
    CheckInMapper,

    CheckInValidationService,
    AutoCheckoutService,

    CheckInUseCase,
    DayPassCheckInUseCase,
    QrCheckInUseCase,
    CheckOutUseCase,
    GetCheckInsUseCase,
  ],
  exports: [CheckInRepository, GetCheckInsUseCase],
})
export class CheckInsModule {}
