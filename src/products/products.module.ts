/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        setHeaders: (res, path) => {
          // Set proper headers for images
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
          }
        },
      },
    }),
    ConfigModule,
    FileStorageModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
