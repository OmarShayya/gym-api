import { Injectable, Logger } from '@nestjs/common';
import { MemberRepository } from '../../infrastructure/repositories/member.repository';
import { MemberMapper } from '../../infrastructure/mappers/member.mapper';
import { IMember } from '../../domain/interfaces/member.interface';
import { MemberStatus } from '../../domain/enums/member-status.enum';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class UpdateMemberStatusUseCase {
  private readonly logger = new Logger(UpdateMemberStatusUseCase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberMapper: MemberMapper,
  ) {}

  async execute(id: string, status: MemberStatus): Promise<IMember> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new ResourceNotFoundException('Member', id);
    }

    const updatedMember = await this.memberRepository.updateStatus(id, status);
    if (!updatedMember) {
      throw new ResourceNotFoundException('Member', id);
    }

    this.logger.log(
      `Member status updated: ${updatedMember.email} (${updatedMember.memberId}) - ${status}`,
    );

    return this.memberMapper.toDTOFromDocument(updatedMember);
  }

  async suspend(id: string, reason?: string): Promise<IMember> {
    return this.execute(id, MemberStatus.SUSPENDED);
  }

  async activate(id: string): Promise<IMember> {
    return this.execute(id, MemberStatus.ACTIVE);
  }

  async deactivate(id: string): Promise<IMember> {
    return this.execute(id, MemberStatus.INACTIVE);
  }
}
