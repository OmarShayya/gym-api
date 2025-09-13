import { Injectable, Logger } from '@nestjs/common';
import { SALES_CONSTANTS, SaleStatus } from '../../domain/enums/sale.enum';

@Injectable()
export class SaleService {
  private readonly logger = new Logger(SaleService.name);

  isRefundable(saleDate: Date, status: SaleStatus): boolean {
    if (status !== SaleStatus.COMPLETED) return false;

    const refundWindow = new Date();
    refundWindow.setDate(
      refundWindow.getDate() - SALES_CONSTANTS.REFUND_WINDOW_DAYS,
    );

    return saleDate > refundWindow;
  }

  canTransitionStatus(
    currentStatus: SaleStatus,
    newStatus: SaleStatus,
  ): boolean {
    const validTransitions: Record<SaleStatus, SaleStatus[]> = {
      [SaleStatus.PENDING]: [SaleStatus.COMPLETED, SaleStatus.CANCELLED],
      [SaleStatus.COMPLETED]: [SaleStatus.REFUNDED, SaleStatus.PARTIAL_REFUND],
      [SaleStatus.CANCELLED]: [],
      [SaleStatus.REFUNDED]: [],
      [SaleStatus.PARTIAL_REFUND]: [SaleStatus.REFUNDED],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  formatSaleNumber(saleNumber: string): string {
    return saleNumber.toUpperCase().replace(/[^A-Z0-9]/g, '-');
  }

  validateSaleItems(items: any[]): boolean {
    if (!items || items.length === 0) return false;
    if (items.length > SALES_CONSTANTS.MAX_ITEMS_PER_SALE) return false;

    return items.every(
      (item) => item.productId && item.quantity > 0 && item.unitPrice >= 0,
    );
  }
}
