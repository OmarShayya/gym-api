import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import {
  Product,
  ProductSchema,
} from './infrastructure/schemas/product.schema';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { ProductMapper } from './infrastructure/mappers/product.mapper';

import { ProductsController } from './presentation/controllers/products.controller';

import { ProductService } from './application/services/product.service';
import { ProductsService } from './products.service';

import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case';
import { UpdateStockUseCase } from './application/use-cases/update-stock.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ProductStatisticsUseCase } from './application/use-cases/product-statistics.use-case';

import { FileStorageModule } from '../file-storage/file-storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        setHeaders: (res, path) => {
          if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            res.set('Cache-Control', 'public, max-age=31536000');
          }
        },
      },
    }),
    ConfigModule,
    FileStorageModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductRepository,
    ProductMapper,

    ProductService,
    ProductsService,

    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductUseCase,
    SearchProductsUseCase,
    UpdateStockUseCase,
    DeleteProductUseCase,
    ProductStatisticsUseCase,
  ],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
