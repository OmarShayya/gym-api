import { Injectable } from '@nestjs/common';
import { MemberRepository } from './infrastructure/repositories/member.repository';
import { MemberDocument } from './infrastructure/schemas/member.schema';
import { MemberService } from './application/services/member.service';
import { MemberMapper } from './infrastructure/mappers/member.mapper';
import { CreateMemberUseCase } from './application/use-cases/create-member.use-case';

@Injectable()
export class MembersService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberService: MemberService,
    private readonly memberMapper: MemberMapper,
    private readonly createMemberUseCase: CreateMemberUseCase,
  ) {}

  async findByEmail(email: string): Promise<MemberDocument | null> {
    return this.memberRepository.findByEmail(email);
  }

  async findById(id: string): Promise<MemberDocument | null> {
    return this.memberRepository.findById(id);
  }

  async updateLastLogin(id: string): Promise<MemberDocument | null> {
    return this.memberRepository.updateLastLogin(id);
  }

  async create(data: any): Promise<MemberDocument> {
    if (!data.password) {
      data.password = this.memberService.generateTemporaryPassword();
    }

    if (!data.memberId) {
      const hashedPassword = await this.memberService.hashPassword(
        data.password,
      );
      const memberId = this.memberService.generateMemberId();
      const qrCode = await this.memberService.generateQRCode(memberId);

      return this.memberRepository.create({
        ...data,
        password: hashedPassword,
        memberId,
        qrCode,
      });
    }

    return this.memberRepository.create(data);
  }
}
