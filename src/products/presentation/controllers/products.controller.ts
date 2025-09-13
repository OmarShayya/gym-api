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
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { SearchProductsUseCase } from '../../application/use-cases/search-products.use-case';
import { UpdateStockUseCase } from '../../application/use-cases/update-stock.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { ProductStatisticsUseCase } from '../../application/use-cases/product-statistics.use-case';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SearchProductsDto } from '../dto/search-products.dto';
import { UpdateStockDto, BulkStockUpdateDto } from '../dto/update-stock.dto';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { IAuthUser } from '../../../auth/domain/interfaces/auth.interface';
import { PRODUCT_CONSTANTS } from '../../domain/enums/product.enum';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly productStatisticsUseCase: ProductStatisticsUseCase,
  ) {}

  @Version('1')
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: IAuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: PRODUCT_CONSTANTS.MAX_FILE_SIZE,
          }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    createProductDto.createdBy = user.id;
    return this.createProductUseCase.execute(createProductDto, image);
  }

  @Version('1')
  @Get()
  async search(@Query() searchDto: SearchProductsDto) {
    return this.searchProductsUseCase.execute(searchDto);
  }

  @Version('1')
  @Get('categories')
  async getCategories() {
    return this.getProductUseCase.getCategories();
  }

  @Version('1')
  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getLowStockProducts() {
    return this.getProductUseCase.getLowStockProducts();
  }

  @Version('1')
  @Get('out-of-stock')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getOutOfStockProducts() {
    return this.getProductUseCase.getOutOfStockProducts();
  }

  @Version('1')
  @Get('statistics')
  @Roles(UserRole.ADMIN)
  async getStatistics() {
    return this.productStatisticsUseCase.getStatistics();
  }

  @Version('1')
  @Get('statistics/:category')
  @Roles(UserRole.ADMIN)
  async getCategoryStatistics(@Param('category') category: any) {
    return this.productStatisticsUseCase.getCategoryStatistics(category);
  }

  @Version('1')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getProductUseCase.getById(id);
  }

  @Version('1')
  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return this.getProductUseCase.getBySku(sku);
  }

  @Version('1')
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.getProductUseCase.getBySlug(slug);
  }

  @Version('1')
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: IAuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: PRODUCT_CONSTANTS.MAX_FILE_SIZE,
          }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    updateProductDto.lastModifiedBy = user.id;
    return this.updateProductUseCase.execute(id, updateProductDto, image);
  }

  @Version('1')
  @Post(':id/images')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FilesInterceptor('images', PRODUCT_CONSTANTS.MAX_IMAGES))
  async addImages(
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: PRODUCT_CONSTANTS.MAX_FILE_SIZE,
          }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    images: Express.Multer.File[],
  ) {
    return this.updateProductUseCase.addImages(id, images);
  }

  @Version('1')
  @Delete(':id/images/:imageIndex')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async removeImage(
    @Param('id') id: string,
    @Param('imageIndex') imageIndex: string,
  ) {
    const index = parseInt(imageIndex, 10);
    if (isNaN(index) || index < 0) {
      throw new Error('Invalid image index');
    }
    return this.updateProductUseCase.removeImage(id, index);
  }

  @Version('1')
  @Patch(':id/stock')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.updateStockUseCase.execute(id, updateStockDto);
  }

  @Version('1')
  @Post(':id/reserve')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async reserveStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.updateStockUseCase.reserveStock(id, quantity);
  }

  @Version('1')
  @Post(':id/release')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async releaseStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.updateStockUseCase.releaseStock(id, quantity);
  }

  @Version('1')
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteProductUseCase.execute(id);
  }

  @Version('1')
  @Post('bulk/update-stock')
  @Roles(UserRole.ADMIN)
  async bulkUpdateStock(@Body() updates: BulkStockUpdateDto[]) {
    return this.updateStockUseCase.bulkUpdate(updates);
  }

  @Version('1')
  @Delete('bulk/delete')
  @Roles(UserRole.ADMIN)
  async bulkDelete(@Body('ids') ids: string[]) {
    return this.deleteProductUseCase.bulkDelete(ids);
  }
}
