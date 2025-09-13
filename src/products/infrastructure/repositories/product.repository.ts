import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import {
  IProductSearchFilters,
  IProductSearchResult,
} from '../../domain/interfaces/product.interface';
import {
  ProductStatus,
  ProductCategory,
} from '../../domain/enums/product.enum';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(data: any): Promise<ProductDocument> {
    const product = new this.productModel(data);
    return product.save();
  }

  async findById(id: string): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.productModel.findById(id).exec();
  }

  async findBySku(sku: string): Promise<ProductDocument | null> {
    return this.productModel.findOne({ sku }).exec();
  }

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return this.productModel.findOne({ slug }).exec();
  }

  async findAll(
    filters?: Partial<IProductSearchFilters>,
  ): Promise<ProductDocument[]> {
    const query: any = {};

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.inStock) {
      query.$expr = { $gt: [{ $subtract: ['$stock', '$reservedStock'] }, 0] };
    }

    return this.productModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async search(
    filters: IProductSearchFilters,
    page: number,
    limit: number,
  ): Promise<IProductSearchResult> {
    const query: any = {};

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.inStock) {
      query.$expr = { $gt: [{ $subtract: ['$stock', '$reservedStock'] }, 0] };
    }

    if (filters.lowStockOnly) {
      query.$expr = {
        $and: [
          {
            $lte: [
              { $subtract: ['$stock', '$reservedStock'] },
              '$lowStockThreshold',
            ],
          },
          { $gt: [{ $subtract: ['$stock', '$reservedStock'] }, 0] },
        ],
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.supplier) {
      query.supplier = filters.supplier;
    }

    const skip = (page - 1) * limit;

    const sortOptions: any = filters.search
      ? { score: { $meta: 'textScore' }, createdAt: -1 }
      : { createdAt: -1 };

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    return {
      products: products.map((p) => this.toPlainObject(p)),
      total,
      page,
      limit,
      hasMore: skip + products.length < total,
      filters,
    };
  }

  async update(id: string, data: any): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateStock(
    id: string,
    stock: number,
    reservedStock?: number,
  ): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const updateData: any = { stock };
    if (reservedStock !== undefined) {
      updateData.reservedStock = reservedStock;
    }
    return this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.productModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findByCategory(category: ProductCategory): Promise<ProductDocument[]> {
    return this.productModel
      .find({ category, status: ProductStatus.ACTIVE })
      .exec();
  }

  async findLowStockProducts(): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        $expr: {
          $and: [
            {
              $lte: [
                { $subtract: ['$stock', '$reservedStock'] },
                '$lowStockThreshold',
              ],
            },
            { $gt: [{ $subtract: ['$stock', '$reservedStock'] }, 0] },
          ],
        },
        status: ProductStatus.ACTIVE,
      })
      .exec();
  }

  async findOutOfStockProducts(): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        $expr: { $lte: [{ $subtract: ['$stock', '$reservedStock'] }, 0] },
        status: ProductStatus.ACTIVE,
      })
      .exec();
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category').exec();
  }

  async getStatistics(): Promise<any> {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          averagePrice: { $avg: '$price' },
          byCategory: { $push: '$category' },
          byStatus: { $push: '$status' },
        },
      },
    ];

    const results = await this.productModel.aggregate(pipeline).exec();
    return results[0] || null;
  }

  async bulkUpdateStatus(
    ids: string[],
    status: ProductStatus,
  ): Promise<number> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const result = await this.productModel
      .updateMany({ _id: { $in: validIds } }, { status })
      .exec();
    return result.modifiedCount;
  }

  async checkSkuExists(sku: string, excludeId?: string): Promise<boolean> {
    const query: any = { sku };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    const count = await this.productModel.countDocuments(query).exec();
    return count > 0;
  }

  private toPlainObject(doc: ProductDocument): any {
    return doc.toObject({ virtuals: true });
  }
}
