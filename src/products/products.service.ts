/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto, StockOperation } from './dto/update-stock.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import {
  FileStorageService,
  FileUploadResult,
} from '../file-storage/file-storage.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<ProductDocument> {
    // Check if SKU already exists
    const existingProduct = await this.productModel
      .findOne({ sku: createProductDto.sku })
      .exec();

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const productData: Partial<Product> = { ...createProductDto };

    // Upload image to local storage if provided
    if (image) {
      try {
        const uploadResult: FileUploadResult =
          await this.fileStorageService.uploadImage(image, 'products');

        productData.imageUrl = uploadResult.url;
        productData.imageFilename = uploadResult.filename;
        productData.thumbnailUrl = uploadResult.thumbnailUrl;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw new BadRequestException('Failed to upload image');
      }
    }

    const createdProduct = new this.productModel(productData);
    return createdProduct.save();
  }

  async search(searchDto: SearchProductsDto): Promise<{
    products: ProductDocument[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      search,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      limit = 50,
      offset = 0,
      lowStockOnly,
    } = searchDto;

    // Build query
    const query: FilterQuery<ProductDocument> = {};

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (lowStockOnly) {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // If text search, include score for relevance
    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sortObj.score = { $meta: 'textScore' } as any;
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort(sortObj)
        .skip(offset)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    const hasMore = offset + products.length < total;

    return {
      products,
      total,
      hasMore,
    };
  }

  async findAll(
    category?: string,
    isActive?: boolean,
  ): Promise<ProductDocument[]> {
    const filter: FilterQuery<ProductDocument> = {};

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return this.productModel.find(filter).exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid product ID');
    }

    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySku(sku: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ sku }).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ slug }).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    image?: Express.Multer.File,
  ): Promise<ProductDocument> {
    const product = await this.findOne(id);

    const updateData: Partial<Product> = { ...updateProductDto };

    // Handle image update
    if (image) {
      try {
        // Delete old image if exists
        if (product.imageFilename) {
          await this.fileStorageService.deleteImage(
            product.imageFilename,
            'products',
          );
        }

        // Upload new image
        const uploadResult: FileUploadResult =
          await this.fileStorageService.uploadImage(image, 'products');

        updateData.imageUrl = uploadResult.url;
        updateData.imageFilename = uploadResult.filename;
        updateData.thumbnailUrl = uploadResult.thumbnailUrl;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw new BadRequestException('Failed to upload image');
      }
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async addImages(
    id: string,
    images: Express.Multer.File[],
  ): Promise<ProductDocument> {
    const product = await this.findOne(id);

    try {
      const uploadResults: FileUploadResult[] =
        await this.fileStorageService.uploadMultipleImages(images, 'products');

      const newImageUrls: string[] = [];
      const newFilenames: string[] = [];

      uploadResults.forEach((result) => {
        newImageUrls.push(result.url);
        newFilenames.push(result.filename);
      });

      product.additionalImages = [
        ...(product.additionalImages || []),
        ...newImageUrls,
      ];
      product.additionalImageFilenames = [
        ...(product.additionalImageFilenames || []),
        ...newFilenames,
      ];

      return product.save();
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new BadRequestException('Failed to upload images');
    }
  }

  async removeImage(id: string, imageIndex: number): Promise<ProductDocument> {
    const product = await this.findOne(id);

    if (
      !product.additionalImages ||
      imageIndex >= product.additionalImages.length
    ) {
      throw new BadRequestException('Invalid image index');
    }

    const filename = product.additionalImageFilenames?.[imageIndex];
    if (filename) {
      try {
        await this.fileStorageService.deleteImage(filename, 'products');
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
      }
    }

    product.additionalImages.splice(imageIndex, 1);
    product.additionalImageFilenames?.splice(imageIndex, 1);

    return product.save();
  }

  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<ProductDocument> {
    const product = await this.findOne(id);

    let newStock: number;

    switch (updateStockDto.operation) {
      case StockOperation.ADD:
        newStock = product.stock + updateStockDto.quantity;
        break;
      case StockOperation.SUBTRACT:
        newStock = product.stock - updateStockDto.quantity;
        if (newStock < 0) {
          throw new BadRequestException('Insufficient stock');
        }
        break;
      case StockOperation.SET:
        newStock = updateStockDto.quantity;
        break;
    }

    product.stock = newStock;
    return product.save();
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    // Delete main image
    if (product.imageFilename) {
      try {
        await this.fileStorageService.deleteImage(
          product.imageFilename,
          'products',
        );
      } catch (error) {
        console.error('Failed to delete main image:', error);
      }
    }

    // Delete additional images
    if (product.additionalImageFilenames?.length) {
      try {
        await this.fileStorageService.deleteMultipleImages(
          product.additionalImageFilenames,
          'products',
        );
      } catch (error) {
        console.error('Failed to delete additional images:', error);
      }
    }

    await this.productModel.deleteOne({ _id: id }).exec();
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category').exec();
  }

  async getLowStockProducts(): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        isActive: true,
      })
      .exec();
  }

  // Bulk operations
  async bulkUpdateStock(
    updates: { productId: string; quantity: number; operation: string }[],
  ): Promise<
    Array<{
      productId: string;
      success: boolean;
      result?: ProductDocument;
      error?: string;
    }>
  > {
    const results: Array<{
      productId: string;
      success: boolean;
      result?: ProductDocument;
      error?: string;
    }> = [];

    for (const update of updates) {
      try {
        const result = await this.updateStock(update.productId, {
          quantity: update.quantity,
          operation: update.operation as StockOperation,
        });
        results.push({ productId: update.productId, success: true, result });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({
          productId: update.productId,
          success: false,
          error: errorMessage,
        });
      }
    }

    return results;
  }

  async bulkToggleActive(productIds: string[]): Promise<
    Array<{
      productId: string;
      success: boolean;
      newStatus?: boolean;
      error?: string;
    }>
  > {
    const results: Array<{
      productId: string;
      success: boolean;
      newStatus?: boolean;
      error?: string;
    }> = [];

    for (const id of productIds) {
      try {
        const product = await this.findOne(id);
        product.isActive = !product.isActive;
        await product.save();
        results.push({
          productId: id,
          success: true,
          newStatus: product.isActive,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({ productId: id, success: false, error: errorMessage });
      }
    }

    return results;
  }

  async decrementStock(
    productId: Types.ObjectId,
    quantity: number,
  ): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    product.stock -= quantity;
    await product.save();
  }
}
