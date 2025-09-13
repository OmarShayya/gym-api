import { ProductDocument } from '../../infrastructure/schemas/product.schema';
import {
  IProductSearchFilters,
  IProductSearchResult,
} from '../interfaces/product.interface';
import { ProductStatus, ProductCategory } from '../enums/product.enum';

export interface IProductRepository {
  create(data: any): Promise<ProductDocument>;
  findById(id: string): Promise<ProductDocument | null>;
  findBySku(sku: string): Promise<ProductDocument | null>;
  findBySlug(slug: string): Promise<ProductDocument | null>;
  findAll(filters?: Partial<IProductSearchFilters>): Promise<ProductDocument[]>;
  search(
    filters: IProductSearchFilters,
    page: number,
    limit: number,
  ): Promise<IProductSearchResult>;
  update(id: string, data: any): Promise<ProductDocument | null>;
  updateStock(
    id: string,
    stock: number,
    reservedStock?: number,
  ): Promise<ProductDocument | null>;
  delete(id: string): Promise<boolean>;
  findByCategory(category: ProductCategory): Promise<ProductDocument[]>;
  findLowStockProducts(): Promise<ProductDocument[]>;
  findOutOfStockProducts(): Promise<ProductDocument[]>;
  getCategories(): Promise<string[]>;
  getStatistics(): Promise<any>;
  bulkUpdateStatus(ids: string[], status: ProductStatus): Promise<number>;
  checkSkuExists(sku: string, excludeId?: string): Promise<boolean>;
}
