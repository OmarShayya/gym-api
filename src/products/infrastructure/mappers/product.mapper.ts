import { Injectable } from '@nestjs/common';
import { ProductDocument } from '../schemas/product.schema';
import { ProductEntity } from '../../domain/entities/product.entity';
import { IProduct } from '../../domain/interfaces/product.interface';
import {
  ProductStatus,
  ProductCategory,
} from '../../domain/enums/product.enum';

@Injectable()
export class ProductMapper {
  toEntity(document: ProductDocument): ProductEntity {
    return new ProductEntity({
      id: document._id.toString(),
      name: document.name,
      description: document.description,
      sku: document.sku,
      slug: document.slug,
      category: document.category as ProductCategory,
      status: document.status as ProductStatus,
      price: document.price,
      costPrice: document.costPrice,
      salePrice: document.salePrice,
      memberPrice: document.memberPrice,
      discountPercentage: document.discountPercentage,
      stock: document.stock,
      reservedStock: document.reservedStock || 0,
      lowStockThreshold: document.lowStockThreshold || 10,
      imageUrl: document.imageUrl,
      imageFilename: document.imageFilename,
      thumbnailUrl: document.thumbnailUrl,
      additionalImages: document.additionalImages,
      additionalImageFilenames: document.additionalImageFilenames,
      tags: document.tags || [],
      weight: document.weight,
      dimensions: document.dimensions,
      supplier: document.supplier,
      barcode: document.barcode,
      createdBy: document.createdBy,
      lastModifiedBy: document.lastModifiedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  toDTO(entity: ProductEntity): IProduct {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      sku: entity.sku,
      slug: entity.slug,
      category: entity.category,
      status: entity.status,
      price: entity.price,
      costPrice: entity.costPrice,
      salePrice: entity.salePrice,
      memberPrice: entity.memberPrice,
      discountPercentage: entity.discountPercentage,
      stock: entity.stock,
      reservedStock: entity.reservedStock,
      availableStock: entity.availableStock,
      lowStockThreshold: entity.lowStockThreshold,
      isLowStock: entity.isLowStock,
      imageUrl: entity.imageUrl,
      imageFilename: entity.imageFilename,
      thumbnailUrl: entity.thumbnailUrl,
      additionalImages: entity.additionalImages,
      additionalImageFilenames: entity.additionalImageFilenames,
      tags: entity.tags,
      weight: entity.weight,
      dimensions: entity.dimensions,
      supplier: entity.supplier,
      barcode: entity.barcode,
      createdBy: entity.createdBy,
      lastModifiedBy: entity.lastModifiedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toDTOFromDocument(document: ProductDocument): IProduct {
    const entity = this.toEntity(document);
    return this.toDTO(entity);
  }
}
