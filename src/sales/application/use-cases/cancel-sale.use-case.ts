import { Injectable, Logger } from '@nestjs/common';
import { SaleRepository } from '../../infrastructure/repositories/sale.repository';
import { SaleMapper } from '../../infrastructure/mappers/sale.mapper';
import { ProductsService } from '../../../products/products.service';
import { ISale } from '../../domain/interfaces/sale.interface';
import { SaleStatus } from '../../domain/enums/sale.enum';
import {
  InvalidOperationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class CancelSaleUseCase {
  private readonly logger = new Logger(CancelSaleUseCase.name);

  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleMapper: SaleMapper,
    private readonly productsService: ProductsService,
  ) {}

  async execute(saleId: string, reason?: string): Promise<ISale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new ResourceNotFoundException('Sale', saleId);
    }

    const entity = this.saleMapper.toEntity(sale);

    if (entity.status !== SaleStatus.PENDING) {
      throw new InvalidOperationException(
        'Only pending sales can be cancelled',
      );
    }

    // Restore stock
    for (const item of entity.items) {
      await this.productsService.incrementStock(item.productId, item.quantity);
    }

    const updatedSale = await this.saleRepository.update(saleId, {
      status: SaleStatus.CANCELLED,
      notes: reason
        ? `${entity.notes || ''}\nCancellation reason: ${reason}`
        : entity.notes,
    });

    this.logger.log(`Sale ${entity.saleNumber} cancelled`);

    return this.saleMapper.toDTO(this.saleMapper.toEntity(updatedSale!));
  }
}
