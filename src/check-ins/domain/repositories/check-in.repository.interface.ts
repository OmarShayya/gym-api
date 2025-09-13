import { CheckInDocument } from '../../infrastructure/schemas/check-in.schema';
import { ICheckInFilters } from '../interfaces/check-in.interface';
import { CheckInStatus } from '../enums/check-in.enum';

export interface ICheckInRepository {
  create(data: any): Promise<CheckInDocument>;
  findById(id: string): Promise<CheckInDocument | null>;
  findActiveByMemberId(memberId: string): Promise<CheckInDocument | null>;
  findActiveByDayPassId(dayPassId: string): Promise<CheckInDocument | null>;
  findByFilters(
    filters: ICheckInFilters,
    limit?: number,
  ): Promise<CheckInDocument[]>;
  findActiveCheckIns(): Promise<CheckInDocument[]>;
  findCheckInsToAutoCheckout(beforeTime: Date): Promise<CheckInDocument[]>;
  findTodayCheckIns(): Promise<CheckInDocument[]>;
  findMemberCheckIns(
    memberId: string,
    limit?: number,
  ): Promise<CheckInDocument[]>;
  update(id: string, data: any): Promise<CheckInDocument | null>;
  updateStatus(
    id: string,
    status: CheckInStatus,
  ): Promise<CheckInDocument | null>;
  countTodayCheckIns(memberId?: string): Promise<number>;
  getStatistics(startDate: Date, endDate: Date): Promise<any>;
}
