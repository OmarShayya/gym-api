import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { ProductMapper } from '../../infrastructure/mappers/product.mapper';
import { SearchProductsDto } from '../../presentation/dto/search-products.dto';
import { IProductSearchResult } from '../../domain/interfaces/product.interface';
import { PRODUCT_CONSTANTS } from '../../domain/enums/product.enum';

@Injectable()
export class SearchProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
  ) {}

  async execute(dto: SearchProductsDto): Promise<IProductSearchResult> {
    const filters = {
      search: dto.search,
      category: dto.category,
      status: dto.status,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      inStock: dto.inStock,
      lowStockOnly: dto.lowStockOnly,
      tags: dto.tags,
      supplier: dto.supplier,
    };

    const page = dto.page || 1;
    const limit = Math.min(
      dto.limit || PRODUCT_CONSTANTS.DEFAULT_PAGE_SIZE,
      PRODUCT_CONSTANTS.MAX_PAGE_SIZE,
    );

    const result = await this.productRepository.search(filters, page, limit);

    return {
      ...result,
      products: result.products.map((p) =>
        this.productMapper.toDTOFromDocument(p as any),
      ),
    };
  }
}
