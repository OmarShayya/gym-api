import { Injectable, Logger } from '@nestjs/common';
import { SaleRepository } from '../../infrastructure/repositories/sale.repository';
import { SaleMapper } from '../../infrastructure/mappers/sale.mapper';
import { MemberRepository } from '../../../members/infrastructure/repositories/member.repository';
import { ProductsService } from '../../../products/products.service';
import { CreateSaleDto } from '../../presentation/dto/create-sale.dto';
import { ISale } from '../../domain/interfaces/sale.interface';
import { SaleEntity } from '../../domain/entities/sale.entity';
import { SaleStatus } from '../../domain/enums/sale.enum';
import {
  InvalidOperationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class CreateSaleUseCase {
  private readonly logger = new Logger(CreateSaleUseCase.name);

  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleMapper: SaleMapper,
    private readonly memberRepository: MemberRepository,
    private readonly productsService: ProductsService,
  ) {}

  async execute(dto: CreateSaleDto): Promise<ISale> {
    const member = await this.memberRepository.findByMemberId(dto.memberId);
    if (!member || member.status !== 'active') {
      throw new InvalidOperationException('Member account is not active');
    }

    const saleItems = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productId);
      if (!product) {
        throw new ResourceNotFoundException('Product', item.productId);
      }

      if (product.stock < item.quantity) {
        throw new InvalidOperationException(
          `Insufficient stock for ${product.name}`,
        );
      }

      const itemSubtotal = product.price * item.quantity;
      saleItems.push({
        productId: product._id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Create sale entity
    const saleEntity = new SaleEntity({
      saleNumber: new SaleEntity({}).generateSaleNumber(),
      memberId: member._id.toString(),
      memberName: `${member.firstName} ${member.lastName}`,
      items: saleItems,
      subtotal,
      paymentMethod: dto.paymentMethod,
      status: SaleStatus.COMPLETED,
      notes: dto.notes,
      processedBy: dto.processedBy,
    });

    saleEntity.calculateTotals();

    const savedSale = await this.saleRepository.create({
      saleNumber: saleEntity.saleNumber,
      memberId: member._id,
      items: saleEntity.items,
      subtotal: saleEntity.subtotal,
      tax: saleEntity.tax,
      total: saleEntity.total,
      paymentMethod: saleEntity.paymentMethod,
      status: saleEntity.status,
      notes: saleEntity.notes,
      processedBy: saleEntity.processedBy,
    });

    // Deduct stock
    for (const item of dto.items) {
      await this.productsService.decrementStock(
        item.productId as any,
        item.quantity,
      );
    }

    this.logger.log(`Sale created: ${saleEntity.saleNumber}`);

    return this.saleMapper.toDTO(saleEntity);
  }
}
