import { Injectable } from '@nestjs/common';
import { CreateSaleUseCase } from './application/use-cases/create-sale.use-case';
import { GetSaleUseCase } from './application/use-cases/get-sale.use-case';
import { CreateSaleDto } from './presentation/dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly getSaleUseCase: GetSaleUseCase,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<any> {
    return this.createSaleUseCase.execute(createSaleDto);
  }

  async findAll(
    startDate?: Date,
    endDate?: Date,
    memberId?: string,
  ): Promise<any[]> {
    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (memberId) filters.memberId = memberId;

    const result = await this.getSaleUseCase.search(filters, 1, 100);
    return result.sales;
  }

  async findOne(id: string): Promise<any> {
    return this.getSaleUseCase.getById(id);
  }

  async findBySaleNumber(saleNumber: string): Promise<any> {
    return this.getSaleUseCase.getBySaleNumber(saleNumber);
  }

  async getMemberPurchaseHistory(memberId: string): Promise<any[]> {
    return this.getSaleUseCase.getMemberPurchaseHistory(memberId);
  }

  async getTodaysSales(): Promise<any[]> {
    return this.getSaleUseCase.getTodaySales();
  }
}
