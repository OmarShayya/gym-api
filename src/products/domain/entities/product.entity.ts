import {
  ProductStatus,
  ProductCategory,
  PRODUCT_CONSTANTS,
} from '../enums/product.enum';
import { IDimensions, IProductPricing } from '../interfaces/product.interface';

export class ProductEntity {
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
  lowStockThreshold: number;
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

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
    this.status = this.status || ProductStatus.ACTIVE;
    this.reservedStock = this.reservedStock || 0;
    this.lowStockThreshold =
      this.lowStockThreshold || PRODUCT_CONSTANTS.DEFAULT_LOW_STOCK_THRESHOLD;
    this.tags = this.tags || [];
    this.additionalImages = this.additionalImages || [];
    this.additionalImageFilenames = this.additionalImageFilenames || [];
  }

  get availableStock(): number {
    return Math.max(0, this.stock - this.reservedStock);
  }

  get isAvailable(): boolean {
    return this.status === ProductStatus.ACTIVE && this.availableStock > 0;
  }

  get isLowStock(): boolean {
    return (
      this.availableStock <= this.lowStockThreshold && this.availableStock > 0
    );
  }

  get isOutOfStock(): boolean {
    return this.availableStock <= 0;
  }

  get effectivePrice(): number {
    if (this.salePrice && this.salePrice > 0) {
      return this.salePrice;
    }
    if (this.discountPercentage && this.discountPercentage > 0) {
      return this.price * (1 - this.discountPercentage / 100);
    }
    return this.price;
  }

  get pricing(): IProductPricing {
    const effectivePrice = this.effectivePrice;
    const savings = this.price - effectivePrice;
    const savingsPercentage = (savings / this.price) * 100;

    return {
      regular: this.price,
      sale: this.salePrice,
      member: this.memberPrice,
      wholesale: undefined,
      effectivePrice,
      savings: savings > 0 ? savings : undefined,
      savingsPercentage: savings > 0 ? savingsPercentage : undefined,
    };
  }

  get profitMargin(): number | undefined {
    if (!this.costPrice) return undefined;
    return ((this.effectivePrice - this.costPrice) / this.effectivePrice) * 100;
  }

  canFulfillOrder(quantity: number): boolean {
    return this.isAvailable && this.availableStock >= quantity;
  }

  reserveStock(quantity: number): void {
    if (!this.canFulfillOrder(quantity)) {
      throw new Error(
        `Insufficient stock. Available: ${this.availableStock}, Requested: ${quantity}`,
      );
    }
    this.reservedStock += quantity;
  }

  releaseStock(quantity: number): void {
    this.reservedStock = Math.max(0, this.reservedStock - quantity);
  }

  addStock(quantity: number): void {
    this.stock += quantity;
  }

  removeStock(quantity: number): void {
    if (this.stock < quantity) {
      throw new Error(
        `Cannot remove ${quantity} items. Current stock: ${this.stock}`,
      );
    }
    this.stock -= quantity;
  }

  setStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock cannot be negative');
    }
    this.stock = quantity;
  }

  updateStatus(newStatus: ProductStatus): void {
    this.status = newStatus;
    if (newStatus === ProductStatus.OUT_OF_STOCK) {
      this.stock = 0;
      this.reservedStock = 0;
    }
  }

  generateSlug(): string {
    return this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }
}
