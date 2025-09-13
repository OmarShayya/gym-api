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
import { CreateMemberUseCase } from '../../application/use-cases/create-member.use-case';
import { UpdateMemberUseCase } from '../../application/use-cases/update-member.use-case';
import { GetMemberUseCase } from '../../application/use-cases/get-member.use-case';
import { SearchMembersUseCase } from '../../application/use-cases/search-members.use-case';
import { UpdateMemberStatusUseCase } from '../../application/use-cases/update-member-status.use-case';
import { DeleteMemberUseCase } from '../../application/use-cases/delete-member.use-case';
import { MemberStatisticsUseCase } from '../../application/use-cases/member-statistics.use-case';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { SearchMembersDto } from '../dto/search-members.dto';
import { UpdateMemberStatusDto } from '../dto/update-status.dto';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { IAuthUser } from '../../../auth/domain/interfaces/auth.interface';

@Controller('members')
@UseGuards(RolesGuard)
export class MembersController {
  constructor(
    private readonly createMemberUseCase: CreateMemberUseCase,
    private readonly updateMemberUseCase: UpdateMemberUseCase,
    private readonly getMemberUseCase: GetMemberUseCase,
    private readonly searchMembersUseCase: SearchMembersUseCase,
    private readonly updateMemberStatusUseCase: UpdateMemberStatusUseCase,
    private readonly deleteMemberUseCase: DeleteMemberUseCase,
    private readonly memberStatisticsUseCase: MemberStatisticsUseCase,
  ) {}

  @Version('1')
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMemberDto: CreateMemberDto) {
    return this.createMemberUseCase.execute(createMemberDto);
  }

  @Version('1')
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findAll() {
    return this.searchMembersUseCase.getAll();
  }

  @Version('1')
  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async search(@Query() searchDto: SearchMembersDto) {
    return this.searchMembersUseCase.execute(searchDto);
  }

  @Version('1')
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getStatistics() {
    return this.memberStatisticsUseCase.execute();
  }

  @Version('1')
  @Get('profile')
  async getMyProfile(@CurrentUser() user: IAuthUser) {
    return this.getMemberUseCase.execute(user.id);
  }

  @Version('1')
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findOne(@Param('id') id: string) {
    return this.getMemberUseCase.execute(id);
  }

  @Version('1')
  @Get('by-member-id/:memberId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findByMemberId(@Param('memberId') memberId: string) {
    return this.getMemberUseCase.getByMemberId(memberId);
  }

  @Version('1')
  @Get('by-qr/:qrCode')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findByQrCode(@Param('qrCode') qrCode: string) {
    return this.getMemberUseCase.getByQrCode(qrCode);
  }

  @Version('1')
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.updateMemberUseCase.execute(id, updateMemberDto);
  }

  @Version('1')
  @Patch('profile/update')
  async updateMyProfile(
    @CurrentUser() user: IAuthUser,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    const allowedFields: UpdateMemberDto = {
      firstName: updateMemberDto.firstName,
      lastName: updateMemberDto.lastName,
      phone: updateMemberDto.phone,
      profilePicture: updateMemberDto.profilePicture,
      emergencyContact: updateMemberDto.emergencyContact,
      address: updateMemberDto.address,
    };
    return this.updateMemberUseCase.execute(user.id, allowedFields);
  }

  @Version('1')
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateMemberStatusDto,
  ) {
    return this.updateMemberStatusUseCase.execute(id, updateStatusDto.status);
  }

  @Version('1')
  @Patch(':id/suspend')
  @Roles(UserRole.ADMIN)
  async suspend(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.updateMemberStatusUseCase.suspend(id, reason);
  }

  @Version('1')
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  async activate(@Param('id') id: string) {
    return this.updateMemberStatusUseCase.activate(id);
  }

  @Version('1')
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id') id: string) {
    return this.updateMemberStatusUseCase.deactivate(id);
  }

  @Version('1')
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteMemberUseCase.execute(id);
  }
}
