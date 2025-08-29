import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CheckInsService, DayPassCheckInDto } from './check-ins.service';
import { CheckInDto, CheckOutDto } from './dto/check-in.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('check-ins')
@UseGuards(JwtAuthGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post('in')
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.checkInsService.checkIn(checkInDto);
  }

  @Post('day-pass/in')
  checkInDayPass(@Body() dayPassCheckInDto: DayPassCheckInDto) {
    return this.checkInsService.checkInWithDayPass(dayPassCheckInDto);
  }

  @Post('qr/:qrCode')
  @Public()
  checkInByQr(@Param('qrCode') qrCode: string) {
    return this.checkInsService.checkInByQrCode(qrCode);
  }

  @Post('out')
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.checkInsService.checkOut(checkOutDto);
  }

  @Get('member/:memberId')
  getMemberCheckIns(
    @Param('memberId') memberId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.checkInsService.getMemberCheckIns(memberId, limitNumber);
  }

  @Get('active')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getActiveCheckIns() {
    return this.checkInsService.getActiveCheckIns();
  }

  @Get('today')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getTodaysCheckIns() {
    return this.checkInsService.getTodaysCheckIns();
  }

  @Get(':id')
  getCheckInById(@Param('id') id: string) {
    return this.checkInsService.getCheckInById(id);
  }
}
