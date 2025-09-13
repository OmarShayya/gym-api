import { Injectable } from '@nestjs/common';
import { SaleRepository } from '../../infrastructure/repositories/sale.repository';
import { SaleMapper } from '../../infrastructure/mappers/sale.mapper';
import {
  ISale,
  ISaleSearchResult,
} from '../../domain/interfaces/sale.interface';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class GetSaleUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleMapper: SaleMapper,
  ) {}

  async getById(id: string): Promise<ISale> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new ResourceNotFoundException('Sale', id);
    }
    return this.saleMapper.toDTO(this.saleMapper.toEntity(sale));
  }

  async getBySaleNumber(saleNumber: string): Promise<ISale> {
    const sale = await this.saleRepository.findBySaleNumber(saleNumber);
    if (!sale) {
      throw new ResourceNotFoundException('Sale', saleNumber);
    }
    return this.saleMapper.toDTO(this.saleMapper.toEntity(sale));
  }

  async getMemberPurchaseHistory(memberId: string): Promise<ISale[]> {
    const sales = await this.saleRepository.findByMemberId(memberId);
    return sales.map((sale) =>
      this.saleMapper.toDTO(this.saleMapper.toEntity(sale)),
    );
  }

  async getTodaySales(): Promise<ISale[]> {
    const sales = await this.saleRepository.findTodaySales();
    return sales.map((sale) =>
      this.saleMapper.toDTO(this.saleMapper.toEntity(sale)),
    );
  }

  async search(
    filters: any,
    page: number = 1,
    limit: number = 20,
  ): Promise<ISaleSearchResult> {
    return this.saleRepository.search(filters, page, limit);
  }
}
