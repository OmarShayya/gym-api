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
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { SearchMembersDto } from './dto/search-members.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles('admin')
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.membersService.findAll();
  }

  @Get('search')
  @Roles('admin')
  search(@Query() searchDto: SearchMembersDto) {
    return this.membersService.search(searchDto);
  }

  @Get('statistics')
  @Roles('admin')
  getStatistics() {
    return this.membersService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Get('by-member-id/:memberId')
  findByMemberId(@Param('memberId') memberId: string) {
    return this.membersService.findByMemberId(memberId);
  }

  @Get('by-qr/:qrCode')
  findByQrCode(@Param('qrCode') qrCode: string) {
    return this.membersService.findByQrCode(qrCode);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'inactive' | 'suspended',
  ) {
    return this.membersService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}
