import {
  ProductStatus,
  ProductCategory,
  PriceType,
} from '../../domain/enums/product.enum';

export class ProductDimensionsDto {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export class ProductPricingDto {
  regular: number;
  sale?: number;
  member?: number;
  wholesale?: number;
  effectivePrice: number;
  savings?: number;
  savingsPercentage?: number;
}

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  sku: string;
  slug: string;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  costPrice?: number;
  salePrice?: number;
  memberPrice?: number;
  discountPercentage?: number;
  pricing: ProductPricingDto;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  additionalImages?: string[];
  tags: string[];
  weight?: number;
  dimensions?: ProductDimensionsDto;
  supplier?: string;
  barcode?: string;
  profitMargin?: number;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class ProductStatisticsDto {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  byCategory: Record<string, number>;
  averagePrice: number;
}

export class StockUpdateResponseDto {
  productId: string;
  sku: string;
  previousStock: number;
  newStock: number;
  previousReserved: number;
  newReserved: number;
  availableStock: number;
  operation: string;
  timestamp: Date;
}

export class BulkOperationResponseDto<T = any> {
  success: T[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  total: number;
  successCount: number;
  failedCount: number;
}
