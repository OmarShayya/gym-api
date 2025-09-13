import { Injectable, Logger } from '@nestjs/common';
import { MemberRepository } from '../../infrastructure/repositories/member.repository';
import { MemberMapper } from '../../infrastructure/mappers/member.mapper';
import { UpdateMemberDto } from '../../presentation/dto/update-member.dto';
import { IMember } from '../../domain/interfaces/member.interface';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class UpdateMemberUseCase {
  private readonly logger = new Logger(UpdateMemberUseCase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberMapper: MemberMapper,
  ) {}

  async execute(id: string, dto: UpdateMemberDto): Promise<IMember> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new ResourceNotFoundException('Member', id);
    }

    const updateData: any = {};

    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.fingerprintId !== undefined)
      updateData.fingerprintId = dto.fingerprintId;
    if (dto.membershipStartDate) {
      updateData.membershipStartDate = new Date(dto.membershipStartDate);
    }
    if (dto.membershipEndDate) {
      updateData.membershipEndDate = new Date(dto.membershipEndDate);
    }
    if (dto.membershipType) updateData.membershipType = dto.membershipType;
    if (dto.status) updateData.status = dto.status;
    if (dto.role) updateData.role = dto.role;
    if (dto.profilePicture) updateData.profilePicture = dto.profilePicture;
    if (dto.emergencyContact)
      updateData.emergencyContact = dto.emergencyContact;
    if (dto.address) updateData.address = dto.address;

    const updatedMember = await this.memberRepository.update(id, updateData);
    if (!updatedMember) {
      throw new ResourceNotFoundException('Member', id);
    }

    this.logger.log(
      `Member updated: ${updatedMember.email} (${updatedMember.memberId})`,
    );

    return this.memberMapper.toDTOFromDocument(updatedMember);
  }
}
