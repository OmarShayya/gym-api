import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductMapper } from '../../infrastructure/mappers/product.mapper';
import { IProduct } from '../../domain/interfaces/product.interface';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class GetProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
  ) {}

  async getById(id: string): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ResourceNotFoundException('Product', id);
    }
    return this.productMapper.toDTOFromDocument(product);
  }

  async getBySku(sku: string): Promise<IProduct> {
    const product = await this.productRepository.findBySku(sku);
    if (!product) {
      throw new ResourceNotFoundException('Product', sku);
    }
    return this.productMapper.toDTOFromDocument(product);
  }

  async getBySlug(slug: string): Promise<IProduct> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new ResourceNotFoundException('Product', slug);
    }
    return this.productMapper.toDTOFromDocument(product);
  }

  async getAll(): Promise<IProduct[]> {
    const products = await this.productRepository.findAll();
    return products.map((product) =>
      this.productMapper.toDTOFromDocument(product),
    );
  }

  async getLowStockProducts(): Promise<IProduct[]> {
    const products = await this.productRepository.findLowStockProducts();
    return products.map((product) =>
      this.productMapper.toDTOFromDocument(product),
    );
  }

  async getOutOfStockProducts(): Promise<IProduct[]> {
    const products = await this.productRepository.findOutOfStockProducts();
    return products.map((product) =>
      this.productMapper.toDTOFromDocument(product),
    );
  }

  async getCategories(): Promise<string[]> {
    return this.productRepository.getCategories();
  }
}
