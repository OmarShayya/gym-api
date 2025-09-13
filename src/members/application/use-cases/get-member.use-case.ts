import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../../infrastructure/repositories/member.repository';
import { MemberMapper } from '../../infrastructure/mappers/member.mapper';
import { IMember } from '../../domain/interfaces/member.interface';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class GetMemberUseCase {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberMapper: MemberMapper,
  ) {}

  async execute(id: string): Promise<IMember> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new ResourceNotFoundException('Member', id);
    }

    return this.memberMapper.toDTOFromDocument(member);
  }

  async getByEmail(email: string): Promise<IMember> {
    const member = await this.memberRepository.findByEmail(email);
    if (!member) {
      throw new ResourceNotFoundException('Member', email);
    }

    return this.memberMapper.toDTOFromDocument(member);
  }

  async getByMemberId(memberId: string): Promise<IMember> {
    const member = await this.memberRepository.findByMemberId(memberId);
    if (!member) {
      throw new ResourceNotFoundException('Member', memberId);
    }

    return this.memberMapper.toDTOFromDocument(member);
  }

  async getByQrCode(qrCode: string): Promise<IMember> {
    let memberId: string;

    try {
      const qrData = JSON.parse(qrCode);
      memberId = qrData.memberId;
    } catch {
      memberId = qrCode;
    }

    const member = await this.memberRepository.findByMemberId(memberId);
    if (!member) {
      throw new ResourceNotFoundException('Member', memberId);
    }

    return this.memberMapper.toDTOFromDocument(member);
  }
}
