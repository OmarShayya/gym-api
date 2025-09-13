import { Injectable } from '@nestjs/common';
import { SaleDocument } from '../schemas/sale.schema';
import { SaleEntity } from '../../domain/entities/sale.entity';
import { ISale } from '../../domain/interfaces/sale.interface';
import { PaymentMethod, SaleStatus } from '../../domain/enums/sale.enum';

@Injectable()
export class SaleMapper {
  toEntity(document: SaleDocument): SaleEntity {
    return new SaleEntity({
      id: document._id.toString(),
      saleNumber: document.saleNumber,
      memberId: document.memberId.toString(),
      items: document.items.map((item) => ({
        productId: item.productId.toString(),
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        refundedQuantity: item.refundedQuantity,
      })),
      subtotal: document.subtotal,
      tax: document.tax,
      total: document.total,
      paymentMethod: document.paymentMethod as PaymentMethod,
      status: document.status as SaleStatus,
      notes: document.notes,
      processedBy: document.processedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  toDTO(entity: SaleEntity): ISale {
    return {
      id: entity.id,
      saleNumber: entity.saleNumber,
      memberId: entity.memberId,
      memberName: entity.memberName,
      items: entity.items,
      subtotal: entity.subtotal,
      discount: entity.discount,
      tax: entity.tax,
      total: entity.total,
      paymentMethod: entity.paymentMethod,
      status: entity.status,
      notes: entity.notes,
      refundInfo: entity.refundInfo,
      processedBy: entity.processedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
