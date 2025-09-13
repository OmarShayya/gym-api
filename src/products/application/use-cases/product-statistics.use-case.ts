import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductService } from '../services/product.service';
import { IProductStatistics } from '../../domain/interfaces/product.interface';
import {
  ProductStatus,
  ProductCategory,
} from '../../domain/enums/product.enum';

@Injectable()
export class ProductStatisticsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productService: ProductService,
  ) {}

  async getStatistics(): Promise<IProductStatistics> {
    const [allProducts, lowStockProducts, outOfStockProducts, statistics] =
      await Promise.all([
        this.productRepository.findAll(),
        this.productRepository.findLowStockProducts(),
        this.productRepository.findOutOfStockProducts(),
        this.productRepository.getStatistics(),
      ]);

    const activeProducts = allProducts.filter(
      (p) => p.status === ProductStatus.ACTIVE,
    );

    const totalValue = this.productService.calculateStockValue(allProducts);

    const byCategory: Record<ProductCategory, number> = {} as any;
    Object.values(ProductCategory).forEach((cat) => {
      byCategory[cat] = allProducts.filter((p) => p.category === cat).length;
    });

    return {
      totalProducts: allProducts.length,
      activeProducts: activeProducts.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      totalValue,
      byCategory,
      averagePrice: statistics?.averagePrice || 0,
    };
  }

  async getCategoryStatistics(category: ProductCategory): Promise<{
    total: number;
    active: number;
    averagePrice: number;
    totalValue: number;
    lowStock: number;
    outOfStock: number;
  }> {
    const products = await this.productRepository.findByCategory(category);

    const active = products.filter((p) => p.status === ProductStatus.ACTIVE);
    const lowStock = products.filter((p) => {
      const available = p.stock - (p.reservedStock || 0);
      return available <= p.lowStockThreshold && available > 0;
    });
    const outOfStock = products.filter((p) => {
      const available = p.stock - (p.reservedStock || 0);
      return available <= 0;
    });

    const totalValue = this.productService.calculateStockValue(products);
    const averagePrice =
      products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1);

    return {
      total: products.length,
      active: active.length,
      averagePrice,
      totalValue,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
    };
  }
}
