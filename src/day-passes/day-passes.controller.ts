import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DayPassesService } from './day-passes.service';
import { CreateDayPassDto } from './dto/create-day-pass.dto';
import { UpdateDayPassDto } from './dto/update-day-pass.dto';
import { UseDayPassDto } from './dto/use-day-pass.dto';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('day-passes')
export class DayPassesController {
  constructor(private readonly dayPassesService: DayPassesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createDayPassDto: CreateDayPassDto) {
    return this.dayPassesService.create(createDayPassDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.dayPassesService.findAll();
  }

  @Get('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getTodaysPasses() {
    return this.dayPassesService.getTodaysPasses();
  }

  @Get('expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getExpiredPasses() {
    return this.dayPassesService.getExpiredPasses();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.dayPassesService.findOne(id);
  }

  @Get('by-pass-id/:passId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findByPassId(@Param('passId') passId: string) {
    return this.dayPassesService.findByPassId(passId);
  }

  @Get('by-qr/:qrCode')
  @Public()
  findByQrCode(@Param('qrCode') qrCode: string) {
    return this.dayPassesService.findByQrCode(qrCode);
  }

  @Post('use')
  @Public()
  useDayPass(@Body() useDayPassDto: UseDayPassDto) {
    return this.dayPassesService.useDayPass(useDayPassDto.passId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDayPassDto: UpdateDayPassDto) {
    return this.dayPassesService.update(id, updateDayPassDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.dayPassesService.remove(id);
  }
}
