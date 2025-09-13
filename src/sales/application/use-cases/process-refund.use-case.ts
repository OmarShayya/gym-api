import { Injectable, Logger } from '@nestjs/common';
import { SaleRepository } from '../../infrastructure/repositories/sale.repository';
import { SaleMapper } from '../../infrastructure/mappers/sale.mapper';
import { SaleService } from '../services/sale.service';
import { SaleCalculationService } from '../services/sale-calculation.service';
import { ProductsService } from '../../../products/products.service';
import { RefundRequestDto } from '../../presentation/dto/refund-request.dto';
import { ISale } from '../../domain/interfaces/sale.interface';
import { SaleStatus, RefundReason } from '../../domain/enums/sale.enum';
import {
  InvalidOperationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class ProcessRefundUseCase {
  private readonly logger = new Logger(ProcessRefundUseCase.name);

  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleMapper: SaleMapper,
    private readonly saleService: SaleService,
    private readonly calculationService: SaleCalculationService,
    private readonly productsService: ProductsService,
  ) {}

  async execute(saleId: string, dto: RefundRequestDto): Promise<ISale> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new ResourceNotFoundException('Sale', saleId);
    }

    const entity = this.saleMapper.toEntity(sale);

    if (!this.saleService.isRefundable(entity.createdAt, entity.status)) {
      throw new InvalidOperationException('Sale is not eligible for refund');
    }

    // Calculate refund amount
    const refundQuantities = new Map<string, number>();
    dto.items.forEach((item) => {
      refundQuantities.set(item.productId, item.quantity);
    });

    const refundAmount = this.calculationService.calculateRefundAmount(
      entity.items,
      refundQuantities,
    );

    // Restore stock
    for (const refundItem of dto.items) {
      await this.productsService.incrementStock(
        refundItem.productId,
        refundItem.quantity,
      );
    }

    // Update sale status
    const newStatus =
      refundAmount >= entity.total
        ? SaleStatus.REFUNDED
        : SaleStatus.PARTIAL_REFUND;

    const updatedSale = await this.saleRepository.update(saleId, {
      status: newStatus,
      refundInfo: {
        reason: dto.reason,
        amount: refundAmount,
        items: dto.items,
        processedAt: new Date(),
        processedBy: dto.processedBy,
        notes: dto.notes,
      },
    });

    this.logger.log(`Refund processed for sale ${entity.saleNumber}`);

    return this.saleMapper.toDTO(this.saleMapper.toEntity(updatedSale!));
  }
}
