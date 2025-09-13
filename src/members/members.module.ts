import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Member, MemberSchema } from './infrastructure/schemas/member.schema';
import { MemberRepository } from './infrastructure/repositories/member.repository';
import { MemberMapper } from './infrastructure/mappers/member.mapper';

import { MembersController } from './presentation/controllers/members.controller';

import { MemberService } from './application/services/member.service';
import { MembersService } from './members.service';

import { CreateMemberUseCase } from './application/use-cases/create-member.use-case';
import { UpdateMemberUseCase } from './application/use-cases/update-member.use-case';
import { GetMemberUseCase } from './application/use-cases/get-member.use-case';
import { SearchMembersUseCase } from './application/use-cases/search-members.use-case';
import { UpdateMemberStatusUseCase } from './application/use-cases/update-member-status.use-case';
import { DeleteMemberUseCase } from './application/use-cases/delete-member.use-case';
import { MemberStatisticsUseCase } from './application/use-cases/member-statistics.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  controllers: [MembersController],
  providers: [
    MemberRepository,
    MemberMapper,

    MemberService,
    MembersService,

    CreateMemberUseCase,
    UpdateMemberUseCase,
    GetMemberUseCase,
    SearchMembersUseCase,
    UpdateMemberStatusUseCase,
    DeleteMemberUseCase,
    MemberStatisticsUseCase,
  ],
  exports: [MembersService, MemberRepository, MemberService],
})
export class MembersModule {}
