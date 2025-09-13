import { Injectable, Logger } from '@nestjs/common';
import { MemberRepository } from '../../infrastructure/repositories/member.repository';
import { MemberService } from '../services/member.service';
import { MemberMapper } from '../../infrastructure/mappers/member.mapper';
import { CreateMemberDto } from '../../presentation/dto/create-member.dto';
import { IMember } from '../../domain/interfaces/member.interface';
import { EmailAlreadyExistsException } from '../../../common/exceptions/business-exceptions';
import {
  MemberStatus,
  MembershipType,
} from '../../domain/enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';

@Injectable()
export class CreateMemberUseCase {
  private readonly logger = new Logger(CreateMemberUseCase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberService: MemberService,
    private readonly memberMapper: MemberMapper,
  ) {}

  async execute(dto: CreateMemberDto): Promise<IMember> {
    const existingMember = await this.memberRepository.findByEmail(dto.email);
    if (existingMember) {
      throw new EmailAlreadyExistsException(dto.email);
    }

    const hashedPassword = await this.memberService.hashPassword(dto.password);
    const memberId = this.memberService.generateMemberId();
    const qrCode = await this.memberService.generateQRCode(memberId);

    const memberData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      password: hashedPassword,
      memberId,
      qrCode,
      fingerprintId: dto.fingerprintId,
      membershipStartDate: new Date(dto.membershipStartDate),
      membershipEndDate: new Date(dto.membershipEndDate),
      membershipType: dto.membershipType || MembershipType.BASIC,
      status: dto.status || MemberStatus.ACTIVE,
      role: dto.role || UserRole.MEMBER,
      emergencyContact: dto.emergencyContact,
      address: dto.address,
      totalCheckIns: 0,
    };

    const createdMember = await this.memberRepository.create(memberData);

    this.logger.log(`New member created: ${createdMember.email} (${memberId})`);

    return this.memberMapper.toDTOFromDocument(createdMember);
  }
}
