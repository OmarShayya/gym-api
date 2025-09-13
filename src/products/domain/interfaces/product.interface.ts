import {
  ProductStatus,
  ProductCategory,
  StockOperation,
  PriceType,
} from '../enums/product.enum';

export interface IProduct {
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
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  imageUrl?: string;
  imageFilename?: string;
  thumbnailUrl?: string;
  additionalImages?: string[];
  additionalImageFilenames?: string[];
  tags: string[];
  weight?: number;
  dimensions?: IDimensions;
  supplier?: string;
  barcode?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: 'cm' | 'inch';
}

export interface IProductImage {
  url: string;
  filename: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  order: number;
}

export interface IProductPricing {
  regular: number;
  sale?: number;
  member?: number;
  wholesale?: number;
  effectivePrice: number;
  savings?: number;
  savingsPercentage?: number;
}

export interface IStockMovement {
  productId: string;
  operation: StockOperation;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: string;
  timestamp: Date;
}

export interface IProductStatistics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  byCategory: Record<ProductCategory, number>;
  averagePrice: number;
}

export interface IProductSearchFilters {
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStockOnly?: boolean;
  tags?: string[];
  supplier?: string;
}

export interface IProductSearchResult {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: IProductSearchFilters;
}

export interface ICreateProductData {
  name: string;
  description: string;
  sku: string;
  category: ProductCategory;
  price: number;
  stock: number;
  costPrice?: number;
  salePrice?: number;
  memberPrice?: number;
  discountPercentage?: number;
  lowStockThreshold?: number;
  tags?: string[];
  weight?: number;
  dimensions?: IDimensions;
  supplier?: string;
  barcode?: string;
  status?: ProductStatus;
  createdBy?: string;
}

export interface IUpdateProductData {
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: number;
  costPrice?: number;
  salePrice?: number;
  memberPrice?: number;
  discountPercentage?: number;
  lowStockThreshold?: number;
  tags?: string[];
  weight?: number;
  dimensions?: IDimensions;
  supplier?: string;
  barcode?: string;
  status?: ProductStatus;
  lastModifiedBy?: string;
}

export interface IBulkStockUpdate {
  productId: string;
  operation: StockOperation;
  quantity: number;
  reason?: string;
}
