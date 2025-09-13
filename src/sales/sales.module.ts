import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Sale, SaleSchema } from './infrastructure/schemas/sale.schema';
import { SaleRepository } from './infrastructure/repositories/sale.repository';
import { SaleMapper } from './infrastructure/mappers/sale.mapper';

import { SalesController } from './presentation/controllers/sales.controller';

import { SaleService } from './application/services/sale.service';
import { SaleCalculationService } from './application/services/sale-calculation.service';
import { SalesService } from './sales.service';

import { CreateSaleUseCase } from './application/use-cases/create-sale.use-case';
import { UpdateSaleUseCase } from './application/use-cases/update-sale.use-case';
import { GetSaleUseCase } from './application/use-cases/get-sale.use-case';
import { ProcessRefundUseCase } from './application/use-cases/process-refund.use-case';
import { CancelSaleUseCase } from './application/use-cases/cancel-sale.use-case';
import { SalesReportUseCase } from './application/use-cases/sales-report.use-case';

import { MembersModule } from '../members/members.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    MembersModule,
    ProductsModule,
  ],
  controllers: [SalesController],
  providers: [
    // Repository & Mapper
    SaleRepository,
    SaleMapper,

    // Services
    SaleService,
    SaleCalculationService,
    SalesService,

    // Use Cases
    CreateSaleUseCase,
    UpdateSaleUseCase, // Added this
    GetSaleUseCase,
    ProcessRefundUseCase,
    CancelSaleUseCase,
    SalesReportUseCase,
  ],
  exports: [SalesService, SaleRepository],
})
export class SalesModule {}
