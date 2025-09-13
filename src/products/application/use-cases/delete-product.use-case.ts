import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { FileStorageService } from '../../../file-storage/file-storage.service';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class DeleteProductUseCase {
  private readonly logger = new Logger(DeleteProductUseCase.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ResourceNotFoundException('Product', id);
    }

    // Delete main image
    if (product.imageFilename) {
      try {
        await this.fileStorageService.deleteImage(
          product.imageFilename,
          'products',
        );
      } catch (error) {
        this.logger.error(`Failed to delete main image: ${error.message}`);
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
        this.logger.error(
          `Failed to delete additional images: ${error.message}`,
        );
      }
    }

    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new ResourceNotFoundException('Product', id);
    }

    this.logger.log(`Product deleted: ${product.sku} - ${product.name}`);
  }

  async bulkDelete(ids: string[]): Promise<{
    deleted: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const deleted: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      try {
        await this.execute(id);
        deleted.push(id);
      } catch (error) {
        failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log(
      `Bulk delete: ${deleted.length} deleted, ${failed.length} failed`,
    );

    return { deleted, failed };
  }
}
