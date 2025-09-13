import { Injectable } from '@nestjs/common';
import { MemberDocument } from '../schemas/member.schema';
import { MemberEntity } from '../../domain/entities/member.entity';
import { IMember } from '../../domain/interfaces/member.interface';
import {
  MemberStatus,
  MembershipType,
} from '../../domain/enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';

@Injectable()
export class MemberMapper {
  toEntity(document: MemberDocument): MemberEntity {
    return new MemberEntity({
      id: document._id.toString(),
      firstName: document.firstName,
      lastName: document.lastName,
      email: document.email,
      phone: document.phone,
      memberId: document.memberId,
      qrCode: document.qrCode,
      fingerprintId: document.fingerprintId,
      membershipStartDate: document.membershipStartDate,
      membershipEndDate: document.membershipEndDate,
      membershipType: document.membershipType as MembershipType,
      status: document.status as MemberStatus,
      role: document.role as UserRole,
      lastCheckIn: document.lastCheckIn,
      lastLogin: document.lastLogin,
      totalCheckIns: document.totalCheckIns || 0,
      profilePicture: document.profilePicture,
      emergencyContact: document.emergencyContact,
      address: document.address,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  toDTO(entity: MemberEntity): IMember {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      memberId: entity.memberId,
      qrCode: entity.qrCode,
      fingerprintId: entity.fingerprintId,
      membershipStartDate: entity.membershipStartDate,
      membershipEndDate: entity.membershipEndDate,
      membershipType: entity.membershipType,
      status: entity.status,
      role: entity.role,
      lastCheckIn: entity.lastCheckIn,
      lastLogin: entity.lastLogin,
      totalCheckIns: entity.totalCheckIns,
      profilePicture: entity.profilePicture,
      emergencyContact: entity.emergencyContact,
      address: entity.address,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toDTOFromDocument(document: MemberDocument): IMember {
    const entity = this.toEntity(document);
    return this.toDTO(entity);
  }
}
