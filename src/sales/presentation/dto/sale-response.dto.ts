import { PaymentMethod, SaleStatus } from '../../domain/enums/sale.enum';

export class SaleItemResponseDto {
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  refundedQuantity?: number;
}

export class SaleResponseDto {
  id: string;
  saleNumber: string;
  memberId: string;
  memberName: string;
  items: SaleItemResponseDto[];
  subtotal: number;
  discount?: {
    type: string;
    value: number;
    amount: number;
    description?: string;
  };
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  refundInfo?: any;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
