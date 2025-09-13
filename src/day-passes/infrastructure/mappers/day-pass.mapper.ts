import { Injectable } from '@nestjs/common';
import { DayPassDocument } from '../schemas/day-pass.schema';
import { DayPassEntity } from '../../domain/entities/day-pass.entity';
import { IDayPass } from '../../domain/interfaces/day-pass.interface';
import {
  DayPassStatus,
  PaymentMethod,
  DayPassType,
} from '../../domain/enums/day-pass.enum';

@Injectable()
export class DayPassMapper {
  toEntity(document: DayPassDocument): DayPassEntity {
    return new DayPassEntity({
      id: document._id.toString(),
      firstName: document.firstName,
      lastName: document.lastName,
      email: document.email,
      phone: document.phone,
      passId: document.passId,
      qrCode: document.qrCode,
      validDate: document.validDate,
      type: document.type as DayPassType,
      paymentMethod: document.paymentMethod as PaymentMethod,
      amount: document.amount,
      status: document.status as DayPassStatus,
      usedAt: document.usedAt,
      numberOfPeople: document.numberOfPeople || 1,
      notes: document.notes,
      createdBy: document.createdBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  toDTO(entity: DayPassEntity): IDayPass {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      passId: entity.passId,
      qrCode: entity.qrCode,
      validDate: entity.validDate,
      type: entity.type,
      paymentMethod: entity.paymentMethod,
      amount: entity.amount,
      status: entity.status,
      usedAt: entity.usedAt,
      numberOfPeople: entity.numberOfPeople,
      notes: entity.notes,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toDTOFromDocument(document: DayPassDocument): IDayPass {
    const entity = this.toEntity(document);
    return this.toDTO(entity);
  }
}
