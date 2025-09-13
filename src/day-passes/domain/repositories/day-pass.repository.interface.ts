import { DayPassDocument } from '../../infrastructure/schemas/day-pass.schema';
import {
  IDayPassSearchFilters,
  IDayPassSearchResult,
} from '../interfaces/day-pass.interface';
import { DayPassStatus } from '../enums/day-pass.enum';

export interface IDayPassRepository {
  create(data: any): Promise<DayPassDocument>;
  findById(id: string): Promise<DayPassDocument | null>;
  findByPassId(passId: string): Promise<DayPassDocument | null>;
  findByQrCode(qrCode: string): Promise<DayPassDocument | null>;
  findAll(): Promise<DayPassDocument[]>;
  search(
    filters: IDayPassSearchFilters,
    page: number,
    limit: number,
  ): Promise<IDayPassSearchResult>;
  update(id: string, data: any): Promise<DayPassDocument | null>;
  updateStatus(
    id: string,
    status: DayPassStatus,
  ): Promise<DayPassDocument | null>;
  delete(id: string): Promise<boolean>;
  findTodayPasses(): Promise<DayPassDocument[]>;
  findExpiredPasses(): Promise<DayPassDocument[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<DayPassDocument[]>;
  countByStatus(status?: DayPassStatus): Promise<number>;
  getStatistics(startDate: Date, endDate: Date): Promise<any>;
  bulkUpdateStatus(ids: string[], status: DayPassStatus): Promise<number>;
}
