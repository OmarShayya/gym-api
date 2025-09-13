import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import {
  DayPass,
  DayPassSchema,
} from './infrastructure/schemas/day-pass.schema';
import { DayPassRepository } from './infrastructure/repositories/day-pass.repository';
import { DayPassMapper } from './infrastructure/mappers/day-pass.mapper';

import { DayPassesController } from './presentation/controllers/day-passes.controller';

import { DayPassService } from './application/services/day-pass.service';
import { DayPassesService } from './day-passes.service';

import { CreateDayPassUseCase } from './application/use-cases/create-day-pass.use-case';
import { UpdateDayPassUseCase } from './application/use-cases/update-day-pass.use-case';
import { GetDayPassUseCase } from './application/use-cases/get-day-pass.use-case';
import { UseDayPassUseCase } from './application/use-cases/use-day-pass.use-case';
import { DeleteDayPassUseCase } from './application/use-cases/delete-day-pass.use-case';
import { ExpirePassesUseCase } from './application/use-cases/expire-passes.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DayPass.name, schema: DayPassSchema }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [DayPassesController],
  providers: [
    DayPassRepository,
    DayPassMapper,

    DayPassService,
    DayPassesService,

    CreateDayPassUseCase,
    UpdateDayPassUseCase,
    GetDayPassUseCase,
    UseDayPassUseCase,
    DeleteDayPassUseCase,
    ExpirePassesUseCase,
  ],
  exports: [DayPassesService, DayPassRepository],
})
export class DayPassesModule {}
