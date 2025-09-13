import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { ProductDocument } from './infrastructure/schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findOne(id: string): Promise<ProductDocument | null> {
    return this.productRepository.findById(id);
  }

  async decrementStock(
    productId: Types.ObjectId,
    quantity: number,
  ): Promise<void> {
    const product = await this.productRepository.findById(productId.toString());
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    await this.productRepository.updateStock(
      productId.toString(),
      product.stock - quantity,
      product.reservedStock,
    );
  }

  async incrementStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await this.productRepository.updateStock(
      productId,
      product.stock + quantity,
      product.reservedStock,
    );
  }
}
