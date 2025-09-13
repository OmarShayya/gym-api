import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, image);
  }

  @Get()
  findAll(@Query() searchDto: SearchProductsDto) {
    return this.productsService.search(searchDto);
  }

  @Get('search')
  search(@Query() searchDto: SearchProductsDto) {
    return this.productsService.search(searchDto);
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('low-stock')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    return this.productsService.update(id, updateProductDto, image);
  }

  @Post(':id/images')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('images', 5)) // Max 5 additional images
  async addImages(
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    images: Express.Multer.File[],
  ) {
    return this.productsService.addImages(id, images);
  }

  @Delete(':id/images/:imageIndex')
  @UseGuards(RolesGuard)
  @Roles('admin')
  removeImage(
    @Param('id') id: string,
    @Param('imageIndex') imageIndex: string,
  ) {
    const index = parseInt(imageIndex, 10);
    if (isNaN(index) || index < 0) {
      throw new BadRequestException('Invalid image index');
    }
    return this.productsService.removeImage(id, index);
  }

  @Patch(':id/stock')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.updateStock(id, updateStockDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // Bulk operations
  @Post('bulk/update-stock')
  @UseGuards(RolesGuard)
  @Roles('admin')
  bulkUpdateStock(
    @Body()
    bulkUpdateDto: { productId: string; quantity: number; operation: string }[],
  ) {
    return this.productsService.bulkUpdateStock(bulkUpdateDto);
  }

  @Patch('bulk/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('admin')
  bulkToggleActive(@Body() productIds: string[]) {
    return this.productsService.bulkToggleActive(productIds);
  }
}
