import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductMapper } from '../../infrastructure/mappers/product.mapper';
import { UpdateStockDto } from '../../presentation/dto/update-stock.dto';
import {
  IProduct,
  IBulkStockUpdate,
} from '../../domain/interfaces/product.interface';
import { StockOperation } from '../../domain/enums/product.enum';
import {
  ResourceNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class UpdateStockUseCase {
  private readonly logger = new Logger(UpdateStockUseCase.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
  ) {}

  async execute(id: string, dto: UpdateStockDto): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ResourceNotFoundException('Product', id);
    }

    const entity = this.productMapper.toEntity(product);

    switch (dto.operation) {
      case StockOperation.ADD:
        entity.addStock(dto.quantity);
        break;
      case StockOperation.SUBTRACT:
        entity.removeStock(dto.quantity);
        break;
      case StockOperation.SET:
        entity.setStock(dto.quantity);
        break;
      case StockOperation.RESERVE:
        entity.reserveStock(dto.quantity);
        break;
      case StockOperation.RELEASE:
        entity.releaseStock(dto.quantity);
        break;
      default:
        throw new InvalidOperationException(
          `Invalid stock operation: ${dto.operation}`,
        );
    }

    const updatedProduct = await this.productRepository.updateStock(
      id,
      entity.stock,
      entity.reservedStock,
    );

    if (!updatedProduct) {
      throw new ResourceNotFoundException('Product', id);
    }

    this.logger.log(
      `Stock updated for ${updatedProduct.sku}: ${dto.operation} ${dto.quantity}`,
    );

    return this.productMapper.toDTOFromDocument(updatedProduct);
  }

  async bulkUpdate(updates: IBulkStockUpdate[]): Promise<{
    success: Array<{ productId: string; newStock: number }>;
    failed: Array<{ productId: string; error: string }>;
  }> {
    const success: Array<{ productId: string; newStock: number }> = [];
    const failed: Array<{ productId: string; error: string }> = [];

    for (const update of updates) {
      try {
        const result = await this.execute(update.productId, {
          operation: update.operation,
          quantity: update.quantity,
          reason: update.reason,
        });
        success.push({
          productId: update.productId,
          newStock: result.stock,
        });
      } catch (error) {
        failed.push({
          productId: update.productId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log(
      `Bulk stock update: ${success.length} succeeded, ${failed.length} failed`,
    );

    return { success, failed };
  }

  async reserveStock(productId: string, quantity: number): Promise<IProduct> {
    return this.execute(productId, {
      operation: StockOperation.RESERVE,
      quantity,
      reason: 'Order reservation',
    });
  }

  async releaseStock(productId: string, quantity: number): Promise<IProduct> {
    return this.execute(productId, {
      operation: StockOperation.RELEASE,
      quantity,
      reason: 'Order cancellation',
    });
  }
}
