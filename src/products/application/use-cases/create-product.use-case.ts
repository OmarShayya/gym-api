import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductMapper } from '../../infrastructure/mappers/product.mapper';
import { ProductService } from '../services/product.service';
import { FileStorageService } from '../../../file-storage/file-storage.service';
import { CreateProductDto } from '../../presentation/dto/create-product.dto';
import { IProduct } from '../../domain/interfaces/product.interface';
import {
  ConflictException,
  InvalidOperationException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
    private readonly productService: ProductService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute(
    dto: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<IProduct> {
    const skuExists = await this.productRepository.checkSkuExists(dto.sku);
    if (skuExists) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    const productData = this.productService.sanitizeProductData(dto);
    productData.slug = this.productService.generateSlug(productData.name);

    if (image) {
      if (!this.productService.validateImageFile(image)) {
        throw new InvalidOperationException('Invalid image file');
      }

      try {
        const uploadResult = await this.fileStorageService.uploadImage(
          image,
          'products',
        );
        productData.imageUrl = uploadResult.url;
        productData.imageFilename = uploadResult.filename;
        productData.thumbnailUrl = uploadResult.thumbnailUrl;
      } catch (error) {
        this.logger.error('Image upload failed:', error);
        throw new InvalidOperationException('Failed to upload image');
      }
    }

    const createdProduct = await this.productRepository.create(productData);

    this.logger.log(
      `Product created: ${createdProduct.sku} - ${createdProduct.name}`,
    );

    return this.productMapper.toDTOFromDocument(createdProduct);
  }
}
