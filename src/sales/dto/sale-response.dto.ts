export class SaleItemResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export class SaleResponseDto {
  id: string;
  saleNumber: string;
  memberId: string;
  memberName: string;
  items: SaleItemResponseDto[];
  total: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  createdAt: Date;
}
