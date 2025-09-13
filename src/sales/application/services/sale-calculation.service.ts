import { Injectable } from '@nestjs/common';
import { SALES_CONSTANTS, DiscountType } from '../../domain/enums/sale.enum';
import { IDiscount, ISaleItem } from '../../domain/interfaces/sale.interface';

@Injectable()
export class SaleCalculationService {
  calculateSubtotal(items: ISaleItem[]): number {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  calculateDiscount(subtotal: number, discount?: IDiscount): number {
    if (!discount) return 0;

    if (discount.type === DiscountType.PERCENTAGE) {
      return (subtotal * discount.value) / 100;
    } else if (discount.type === DiscountType.FIXED) {
      return Math.min(discount.value, subtotal);
    } else if (discount.type === DiscountType.MEMBER) {
      return (subtotal * SALES_CONSTANTS.MEMBER_DISCOUNT_PERCENTAGE) / 100;
    }

    return 0;
  }

  calculateTax(amount: number): number {
    return amount * SALES_CONSTANTS.DEFAULT_TAX_RATE;
  }

  calculateTotal(subtotal: number, discount: number, tax: number): number {
    return subtotal - discount + tax;
  }

  calculateItemSubtotal(
    unitPrice: number,
    quantity: number,
    discount?: number,
  ): number {
    const baseAmount = unitPrice * quantity;
    if (discount) {
      return baseAmount - discount;
    }
    return baseAmount;
  }

  validateDiscountAmount(discount: IDiscount, subtotal: number): boolean {
    if (discount.type === DiscountType.PERCENTAGE) {
      return (
        discount.value >= 0 &&
        discount.value <= SALES_CONSTANTS.MAX_DISCOUNT_PERCENTAGE
      );
    } else if (discount.type === DiscountType.FIXED) {
      return discount.value >= 0 && discount.value <= subtotal;
    }
    return true;
  }

  calculateRefundAmount(
    items: ISaleItem[],
    refundQuantities: Map<string, number>,
  ): number {
    let refundAmount = 0;

    items.forEach((item) => {
      const refundQuantity = refundQuantities.get(item.productId) || 0;
      if (refundQuantity > 0) {
        const unitRefund = item.subtotal / item.quantity;
        refundAmount += unitRefund * refundQuantity;
      }
    });

    return refundAmount;
  }

  generateSaleNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${SALES_CONSTANTS.SALE_NUMBER_PREFIX}-${timestamp}-${random}`;
  }
}
