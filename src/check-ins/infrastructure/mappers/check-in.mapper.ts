import { Injectable } from '@nestjs/common';
import { CheckInDocument } from '../schemas/check-in.schema';
import { CheckInEntity } from '../../domain/entities/check-in.entity';
import { ICheckInResponse } from '../../domain/interfaces/check-in.interface';
import {
  CheckInMethod,
  CheckInStatus,
  CheckInType,
} from '../../domain/enums/check-in.enum';

@Injectable()
export class CheckInMapper {
  toEntity(document: CheckInDocument): CheckInEntity {
    return new CheckInEntity({
      id: document._id.toString(),
      memberId: document.memberId?.toString(),
      dayPassId: document.dayPassId,
      checkInTime: document.checkInTime,
      checkOutTime: document.checkOutTime,
      duration: document.duration,
      method: document.method as CheckInMethod,
      status: document.status as CheckInStatus,
      type: document.type as CheckInType,
      autoCheckout: document.autoCheckout,
      scheduledCheckoutTime: document.scheduledCheckoutTime,
      location: document.location,
      notes: document.notes,
      dayPassInfo: document.dayPassInfo,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  toResponse(
    entity: CheckInEntity,
    memberName?: string,
    additionalInfo?: any,
  ): ICheckInResponse {
    return {
      id: entity.id,
      memberId: entity.memberId || entity.dayPassId,
      memberName: memberName || 'Unknown',
      checkInTime: entity.checkInTime,
      checkOutTime: entity.checkOutTime,
      duration: entity.duration,
      method: entity.method,
      status: entity.status,
      type: entity.type,
      scheduledCheckoutTime: entity.scheduledCheckoutTime,
      dayPassInfo: entity.dayPassInfo,
      memberInfo: additionalInfo,
    };
  }

  toResponseFromDocument(
    document: CheckInDocument,
    memberName?: string,
  ): ICheckInResponse {
    const entity = this.toEntity(document);
    return this.toResponse(entity, memberName);
  }
}
