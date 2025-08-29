import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayPassesService } from './day-passes.service';
import { DayPassesController } from './day-passes.controller';
import { DayPass, DayPassSchema } from './schemas/day-pass.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DayPass.name, schema: DayPassSchema }]),
  ],
  controllers: [DayPassesController],
  providers: [DayPassesService],
  exports: [DayPassesService],
})
export class DayPassesModule {}
