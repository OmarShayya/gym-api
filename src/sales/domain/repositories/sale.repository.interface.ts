import { SaleDocument } from '../../infrastructure/schemas/sale.schema';
import { ISaleFilters, ISaleSearchResult } from '../interfaces/sale.interface';
import { SaleStatus } from '../enums/sale.enum';

export interface ISaleRepository {
  create(data: any): Promise<SaleDocument>;
  findById(id: string): Promise<SaleDocument | null>;
  findBySaleNumber(saleNumber: string): Promise<SaleDocument | null>;
  findByMemberId(memberId: string): Promise<SaleDocument[]>;
  findAll(filters?: ISaleFilters): Promise<SaleDocument[]>;
  search(
    filters: ISaleFilters,
    page: number,
    limit: number,
  ): Promise<ISaleSearchResult>;
  update(id: string, data: any): Promise<SaleDocument | null>;
  updateStatus(id: string, status: SaleStatus): Promise<SaleDocument | null>;
  delete(id: string): Promise<boolean>;
  findTodaySales(): Promise<SaleDocument[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<SaleDocument[]>;
  getStatistics(startDate: Date, endDate: Date): Promise<any>;
  getTopProducts(startDate: Date, endDate: Date, limit: number): Promise<any[]>;
  getTopCustomers(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<any[]>;
  getDailySales(startDate: Date, endDate: Date): Promise<any[]>;
}
