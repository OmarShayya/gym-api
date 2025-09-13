import { Types } from 'mongoose';
import { MemberDocument } from '../../members/infrastructure/schemas/member.schema';

export interface PopulatedSale {
  _id: Types.ObjectId;
  memberId: MemberDocument;
  items: Array<{
    productId: Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  total: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  saleNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalesReportResponse {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  period: {
    startDate: Date;
    endDate: Date;
  };
}
