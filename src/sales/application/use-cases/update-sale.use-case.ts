import { Injectable, Logger } from '@nestjs/common';
import { SaleRepository } from '../../infrastructure/repositories/sale.repository';
import { SaleMapper } from '../../infrastructure/mappers/sale.mapper';
import { ISale } from '../../domain/interfaces/sale.interface';
import { SaleStatus } from '../../domain/enums/sale.enum';
import {
  InvalidOperationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class UpdateSaleUseCase {
  private readonly logger = new Logger(UpdateSaleUseCase.name);

  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleMapper: SaleMapper,
  ) {}

  async execute(id: string, updateData: any): Promise<ISale> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new ResourceNotFoundException('Sale', id);
    }

    const entity = this.saleMapper.toEntity(sale);

    // Only allow updates to pending sales
    if (entity.status !== SaleStatus.PENDING) {
      throw new InvalidOperationException('Only pending sales can be updated');
    }

    const updatedSale = await this.saleRepository.update(id, updateData);
    if (!updatedSale) {
      throw new ResourceNotFoundException('Sale', id);
    }

    this.logger.log(`Sale updated: ${entity.saleNumber}`);

    return this.saleMapper.toDTO(this.saleMapper.toEntity(updatedSale));
  }
}
