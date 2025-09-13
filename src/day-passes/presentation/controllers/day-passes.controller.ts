import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { CreateDayPassUseCase } from '../../application/use-cases/create-day-pass.use-case';
import { UpdateDayPassUseCase } from '../../application/use-cases/update-day-pass.use-case';
import { GetDayPassUseCase } from '../../application/use-cases/get-day-pass.use-case';
import { UseDayPassUseCase } from '../../application/use-cases/use-day-pass.use-case';
import { DeleteDayPassUseCase } from '../../application/use-cases/delete-day-pass.use-case';
import { ExpirePassesUseCase } from '../../application/use-cases/expire-passes.use-case';
import { CreateDayPassDto } from '../dto/create-day-pass.dto';
import { UpdateDayPassDto } from '../dto/update-day-pass.dto';
import { UseDayPassDto } from '../dto/use-day-pass.dto';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { IAuthUser } from '../../../auth/domain/interfaces/auth.interface';

@Controller('day-passes')
@UseGuards(RolesGuard)
export class DayPassesController {
  constructor(
    private readonly createDayPassUseCase: CreateDayPassUseCase,
    private readonly updateDayPassUseCase: UpdateDayPassUseCase,
    private readonly getDayPassUseCase: GetDayPassUseCase,
    private readonly useDayPassUseCase: UseDayPassUseCase,
    private readonly deleteDayPassUseCase: DeleteDayPassUseCase,
    private readonly expirePassesUseCase: ExpirePassesUseCase,
  ) {}

  @Version('1')
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDayPassDto: CreateDayPassDto,
    @CurrentUser() user: IAuthUser,
  ) {
    createDayPassDto.createdBy = user.id;
    return this.createDayPassUseCase.execute(createDayPassDto);
  }

  @Version('1')
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findAll() {
    return this.getDayPassUseCase.getAll();
  }

  @Version('1')
  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getTodaysPasses() {
    return this.getDayPassUseCase.getTodayPasses();
  }

  @Version('1')
  @Get('expired')
  @Roles(UserRole.ADMIN)
  async getExpiredPasses() {
    return this.getDayPassUseCase.getExpiredPasses();
  }

  @Version('1')
  @Get('date-range')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.getDayPassUseCase.getByDateRange(startDate, endDate);
  }

  @Version('1')
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findOne(@Param('id') id: string) {
    return this.getDayPassUseCase.getById(id);
  }

  @Version('1')
  @Get('by-pass-id/:passId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findByPassId(@Param('passId') passId: string) {
    return this.getDayPassUseCase.getByPassId(passId);
  }

  @Version('1')
  @Get('by-qr/:qrCode')
  @Public()
  async findByQrCode(@Param('qrCode') qrCode: string) {
    return this.getDayPassUseCase.getByQrCode(qrCode);
  }

  @Version('1')
  @Post('use')
  @Public()
  @HttpCode(HttpStatus.OK)
  async useDayPass(@Body() useDayPassDto: UseDayPassDto) {
    return this.useDayPassUseCase.execute(useDayPassDto.passId);
  }

  @Version('1')
  @Post(':passId/expire')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async expirePass(@Param('passId') passId: string) {
    await this.expirePassesUseCase.manualExpire(passId);
    return { message: 'Day pass expired successfully' };
  }

  @Version('1')
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() updateDayPassDto: UpdateDayPassDto,
  ) {
    return this.updateDayPassUseCase.execute(id, updateDayPassDto);
  }

  @Version('1')
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteDayPassUseCase.execute(id);
  }
}
