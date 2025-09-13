import {
  PaymentMethod,
  SaleStatus,
  DiscountType,
  RefundReason,
} from '../enums/sale.enum';

export interface ISale {
  id: string;
  saleNumber: string;
  memberId: string;
  memberName?: string;
  items: ISaleItem[];
  subtotal: number;
  discount?: IDiscount;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  refundInfo?: IRefundInfo;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISaleItem {
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  refundedQuantity?: number;
}

export interface IDiscount {
  type: DiscountType;
  value: number;
  amount: number;
  description?: string;
}

export interface IRefundInfo {
  reason: RefundReason;
  amount: number;
  items: IRefundItem[];
  processedAt: Date;
  processedBy: string;
  notes?: string;
}

export interface IRefundItem {
  productId: string;
  quantity: number;
  amount: number;
}

export interface ICreateSaleData {
  memberId: string;
  items: ICreateSaleItem[];
  paymentMethod: PaymentMethod;
  discount?: IDiscount;
  notes?: string;
  processedBy?: string;
}

export interface ICreateSaleItem {
  productId: string;
  quantity: number;
}

export interface ISaleFilters {
  memberId?: string;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
  saleNumber?: string;
}

export interface ISaleSearchResult {
  sales: ISale[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ISalesReport {
  totalSales: number;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  averageSaleValue: number;
  totalDiscount: number;
  totalTax: number;
  salesByPaymentMethod: Record<PaymentMethod, number>;
  salesByStatus: Record<SaleStatus, number>;
  topProducts: IProductSalesData[];
  topCustomers: ICustomerSalesData[];
  dailySales: IDailySales[];
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface IProductSalesData {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  averagePrice: number;
}

export interface ICustomerSalesData {
  memberId: string;
  memberName: string;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
}

export interface IDailySales {
  date: Date;
  sales: number;
  revenue: number;
  transactions: number;
}
