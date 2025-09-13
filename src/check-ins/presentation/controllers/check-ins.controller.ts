import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Version,
  Patch,
} from '@nestjs/common';
import { CheckInUseCase } from '../../application/use-cases/check-in.use-case';
import { DayPassCheckInUseCase } from '../../application/use-cases/day-pass-check-in.use-case';
import { QrCheckInUseCase } from '../../application/use-cases/qr-check-in.use-case';
import { CheckOutUseCase } from '../../application/use-cases/check-out.use-case';
import { GetCheckInsUseCase } from '../../application/use-cases/get-check-ins.use-case';
import { CheckInDto } from '../dto/check-in.dto';
import { DayPassCheckInDto } from '../dto/day-pass-check-in.dto';
import { CheckOutDto } from '../dto/check-out.dto';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { IAuthUser } from '../../../auth/domain/interfaces/auth.interface';

@Controller('check-ins')
@UseGuards(RolesGuard)
export class CheckInsController {
  constructor(
    private readonly checkInUseCase: CheckInUseCase,
    private readonly dayPassCheckInUseCase: DayPassCheckInUseCase,
    private readonly qrCheckInUseCase: QrCheckInUseCase,
    private readonly checkOutUseCase: CheckOutUseCase,
    private readonly getCheckInsUseCase: GetCheckInsUseCase,
  ) {}

  @Version('1')
  @Post('member')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async checkInMember(@Body() checkInDto: CheckInDto) {
    return this.checkInUseCase.execute(checkInDto);
  }

  @Version('1')
  @Post('day-pass')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async checkInDayPass(@Body() dayPassCheckInDto: DayPassCheckInDto) {
    return this.dayPassCheckInUseCase.execute(dayPassCheckInDto);
  }

  @Version('1')
  @Post('qr/:qrCode')
  @Public()
  @HttpCode(HttpStatus.OK)
  async checkInByQr(@Param('qrCode') qrCode: string) {
    return this.qrCheckInUseCase.execute(qrCode);
  }

  @Version('1')
  @Post('checkout')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.checkOutUseCase.execute(checkOutDto);
  }

  @Version('1')
  @Post('checkout/:id/force')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async forceCheckOut(@Param('id') id: string, @Body('reason') reason: string) {
    return this.checkOutUseCase.forceCheckOut(id, reason);
  }

  @Version('1')
  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getActiveCheckIns() {
    return this.getCheckInsUseCase.getActiveCheckIns();
  }

  @Version('1')
  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getTodayCheckIns() {
    return this.getCheckInsUseCase.getTodayCheckIns();
  }

  @Version('1')
  @Get('member/:memberId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getMemberCheckIns(
    @Param('memberId') memberId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.getCheckInsUseCase.getMemberCheckIns(memberId, limitNumber);
  }

  @Version('1')
  @Get('my-checkins')
  async getMyCheckIns(
    @CurrentUser() user: IAuthUser,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.getCheckInsUseCase.getMemberCheckIns(
      user.memberId,
      limitNumber,
    );
  }

  @Version('1')
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getCheckInById(@Param('id') id: string) {
    return this.getCheckInsUseCase.getById(id);
  }
}
