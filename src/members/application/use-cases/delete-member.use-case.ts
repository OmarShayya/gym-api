import { Injectable, Logger } from '@nestjs/common';
import { MemberRepository } from '../../infrastructure/repositories/member.repository';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class DeleteMemberUseCase {
  private readonly logger = new Logger(DeleteMemberUseCase.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(id: string): Promise<void> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new ResourceNotFoundException('Member', id);
    }

    const deleted = await this.memberRepository.delete(id);
    if (!deleted) {
      throw new ResourceNotFoundException('Member', id);
    }

    this.logger.log(`Member deleted: ${member.email} (${member.memberId})`);
  }
}
