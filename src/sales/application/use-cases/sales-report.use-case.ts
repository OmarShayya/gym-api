// src/modules/sales/application/use-cases/sales-report.use-case.ts
import { Injectable } from '@nestjs/common';
import { SaleRepository } from '../../infrastructure/repositories/sale.repository';
import { ISalesReport } from '../../domain/interfaces/sale.interface';
import { SaleStatus, PaymentMethod } from '../../domain/enums/sale.enum';

@Injectable()
export class SalesReportUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(startDate: Date, endDate: Date): Promise<ISalesReport> {
    const sales = await this.saleRepository.findByDateRange(startDate, endDate);

    const statistics = await this.saleRepository.getStatistics(
      startDate,
      endDate,
    );
    const topProducts = await this.saleRepository.getTopProducts(
      startDate,
      endDate,
      10,
    );
    const topCustomers = await this.saleRepository.getTopCustomers(
      startDate,
      endDate,
      10,
    );
    const dailySales = await this.saleRepository.getDailySales(
      startDate,
      endDate,
    );

    // Calculate metrics
    const totalRefunds = sales
      .filter(
        (s) =>
          s.status === SaleStatus.REFUNDED ||
          s.status === SaleStatus.PARTIAL_REFUND,
      )
      .reduce((sum, s) => sum + (s.refundInfo?.amount || 0), 0);

    const salesByPaymentMethod: Record<PaymentMethod, number> = {} as any;
    const salesByStatus: Record<SaleStatus, number> = {} as any;

    sales.forEach((sale) => {
      salesByPaymentMethod[sale.paymentMethod as PaymentMethod] =
        (salesByPaymentMethod[sale.paymentMethod as PaymentMethod] || 0) + 1;

      salesByStatus[sale.status as SaleStatus] =
        (salesByStatus[sale.status as SaleStatus] || 0) + 1;
    });

    return {
      totalSales: statistics[0]?.totalSales || 0,
      totalRevenue: statistics[0]?.totalRevenue || 0,
      totalRefunds,
      netRevenue: (statistics[0]?.totalRevenue || 0) - totalRefunds,
      averageSaleValue: statistics[0]?.averageSaleValue || 0,
      totalDiscount: sales.reduce(
        (sum, s) => sum + (s.discount?.amount || 0),
        0,
      ),
      totalTax: sales.reduce((sum, s) => sum + s.tax, 0),
      salesByPaymentMethod,
      salesByStatus,
      topProducts,
      topCustomers,
      dailySales,
      period: {
        startDate,
        endDate,
      },
    };
  }
}
