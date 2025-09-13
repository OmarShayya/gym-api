import { Injectable } from '@nestjs/common';
import { DayPassRepository } from './infrastructure/repositories/day-pass.repository';
import { DayPassDocument } from './infrastructure/schemas/day-pass.schema';

// Compatibility service for check-ins module
@Injectable()
export class DayPassesService {
  constructor(private readonly dayPassRepository: DayPassRepository) {}

  async findByPassId(passId: string): Promise<any> {
    const dayPass = await this.dayPassRepository.findByPassId(passId);
    if (!dayPass) {
      throw new Error(`Day pass ${passId} not found`);
    }
    return this.toSimpleObject(dayPass);
  }

  async findByQrCode(qrCode: string): Promise<any> {
    const dayPass = await this.dayPassRepository.findByQrCode(qrCode);
    if (!dayPass) {
      throw new Error('Day pass not found');
    }
    return this.toSimpleObject(dayPass);
  }

  async useDayPass(passId: string): Promise<any> {
    const dayPass = await this.dayPassRepository.findByPassId(passId);
    if (!dayPass) {
      throw new Error(`Day pass ${passId} not found`);
    }

    if (dayPass.status !== 'active') {
      throw new Error(`Day pass is ${dayPass.status}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(dayPass.validDate);
    validDate.setHours(0, 0, 0, 0);

    if (validDate.getTime() !== today.getTime()) {
      throw new Error('Day pass is not valid for today');
    }

    await this.dayPassRepository.updateStatus(
      dayPass._id.toString(),
      'used' as any,
    );

    return this.toSimpleObject(dayPass);
  }

  private toSimpleObject(dayPass: DayPassDocument): any {
    return {
      passId: dayPass.passId,
      firstName: dayPass.firstName,
      lastName: dayPass.lastName,
      email: dayPass.email,
      phone: dayPass.phone,
      validDate: dayPass.validDate,
      amount: dayPass.amount,
      status: dayPass.status,
    };
  }
}
