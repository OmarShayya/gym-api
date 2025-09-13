import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductMapper } from '../../infrastructure/mappers/product.mapper';
import { ProductService } from '../services/product.service';
import { FileStorageService } from '../../../file-storage/file-storage.service';
import { UpdateProductDto } from '../../presentation/dto/update-product.dto';
import { IProduct } from '../../domain/interfaces/product.interface';
import {
  ResourceNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class UpdateProductUseCase {
  private readonly logger = new Logger(UpdateProductUseCase.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
    private readonly productService: ProductService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateProductDto,
    image?: Express.Multer.File,
  ): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ResourceNotFoundException('Product', id);
    }

    const updateData = this.productService.sanitizeProductData(dto);

    if (updateData.name && updateData.name !== product.name) {
      updateData.slug = this.productService.generateSlug(updateData.name);
    }

    if (image) {
      if (!this.productService.validateImageFile(image)) {
        throw new InvalidOperationException('Invalid image file');
      }

      try {
        if (product.imageFilename) {
          await this.fileStorageService.deleteImage(
            product.imageFilename,
            'products',
          );
        }

        const uploadResult = await this.fileStorageService.uploadImage(
          image,
          'products',
        );
        updateData.imageUrl = uploadResult.url;
        updateData.imageFilename = uploadResult.filename;
        updateData.thumbnailUrl = uploadResult.thumbnailUrl;
      } catch (error) {
        this.logger.error('Image update failed:', error);
        throw new InvalidOperationException('Failed to update image');
      }
    }

    const updatedProduct = await this.productRepository.update(id, updateData);
    if (!updatedProduct) {
      throw new ResourceNotFoundException('Product', id);
    }

    this.logger.log(`Product updated: ${updatedProduct.sku}`);

    return this.productMapper.toDTOFromDocument(updatedProduct);
  }

  async addImages(
    id: string,
    images: Express.Multer.File[],
  ): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ResourceNotFoundException('Product', id);
    }

    const currentImageCount = product.additionalImages?.length || 0;
    const maxAdditional = 5;

    if (currentImageCount + images.length > maxAdditional) {
      throw new InvalidOperationException(
        `Maximum ${maxAdditional} additional images allowed`,
      );
    }

    try {
      const uploadResults = await this.fileStorageService.uploadMultipleImages(
        images,
        'products',
      );

      const newImageUrls = uploadResults.map((r) => r.url);
      const newFilenames = uploadResults.map((r) => r.filename);

      const updateData = {
        additionalImages: [
          ...(product.additionalImages || []),
          ...newImageUrls,
        ],
        additionalImageFilenames: [
          ...(product.additionalImageFilenames || []),
          ...newFilenames,
        ],
      };

      const updatedProduct = await this.productRepository.update(
        id,
        updateData,
      );
      if (!updatedProduct) {
        throw new ResourceNotFoundException('Product', id);
      }

      return this.productMapper.toDTOFromDocument(updatedProduct);
    } catch (error) {
      this.logger.error('Failed to add images:', error);
      throw new InvalidOperationException('Failed to add images');
    }
  }

  async removeImage(id: string, imageIndex: number): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ResourceNotFoundException('Product', id);
    }

    if (
      !product.additionalImages ||
      imageIndex >= product.additionalImages.length
    ) {
      throw new InvalidOperationException('Invalid image index');
    }

    const filename = product.additionalImageFilenames?.[imageIndex];
    if (filename) {
      try {
        await this.fileStorageService.deleteImage(filename, 'products');
      } catch (error) {
        this.logger.error('Failed to delete image file:', error);
      }
    }

    const additionalImages = [...product.additionalImages];
    const additionalImageFilenames = [
      ...(product.additionalImageFilenames || []),
    ];

    additionalImages.splice(imageIndex, 1);
    additionalImageFilenames.splice(imageIndex, 1);

    const updatedProduct = await this.productRepository.update(id, {
      additionalImages,
      additionalImageFilenames,
    });

    if (!updatedProduct) {
      throw new ResourceNotFoundException('Product', id);
    }

    return this.productMapper.toDTOFromDocument(updatedProduct);
  }
}
