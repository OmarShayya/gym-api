import { Injectable, Logger } from '@nestjs/common';
import { PRODUCT_CONSTANTS } from '../../domain/enums/product.enum';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  generateSku(name: string, category: string): string {
    const prefix = category.substring(0, 3).toUpperCase();
    const namePart = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${namePart}-${timestamp}`;
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  calculateDiscountPrice(price: number, discountPercentage: number): number {
    if (discountPercentage <= 0 || discountPercentage > 100) {
      return price;
    }
    return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
  }

  calculateProfitMargin(costPrice: number, sellingPrice: number): number {
    if (costPrice <= 0) return 0;
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
  }

  validateImageFile(file: Express.Multer.File): boolean {
    if (!file) return false;

    const isValidType = PRODUCT_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(
      file.mimetype,
    );
    const isValidSize = file.size <= PRODUCT_CONSTANTS.MAX_FILE_SIZE;

    return isValidType && isValidSize;
  }

  sanitizeProductData(data: any): any {
    const sanitized = { ...data };

    if (sanitized.name) {
      sanitized.name = sanitized.name.trim();
    }

    if (sanitized.description) {
      sanitized.description = sanitized.description.trim();
    }

    if (sanitized.tags && typeof sanitized.tags === 'string') {
      sanitized.tags = sanitized.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    return sanitized;
  }

  calculateStockValue(products: any[]): number {
    return products.reduce((total, product) => {
      const price = product.costPrice || product.price;
      return total + price * product.stock;
    }, 0);
  }
}
