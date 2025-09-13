import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { CreateSaleUseCase } from '../../application/use-cases/create-sale.use-case';
import { GetSaleUseCase } from '../../application/use-cases/get-sale.use-case';
import { ProcessRefundUseCase } from '../../application/use-cases/process-refund.use-case';
import { CancelSaleUseCase } from '../../application/use-cases/cancel-sale.use-case';
import { SalesReportUseCase } from '../../application/use-cases/sales-report.use-case';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { RefundRequestDto } from '../dto/refund-request.dto';
import { SalesFilterDto } from '../dto/sales-filter.dto';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { IAuthUser } from '../../../auth/domain/interfaces/auth.interface';

@Controller('sales')
@UseGuards(RolesGuard)
export class SalesController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly getSaleUseCase: GetSaleUseCase,
    private readonly processRefundUseCase: ProcessRefundUseCase,
    private readonly cancelSaleUseCase: CancelSaleUseCase,
    private readonly salesReportUseCase: SalesReportUseCase,
  ) {}

  @Version('1')
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @CurrentUser() user: IAuthUser,
  ) {
    createSaleDto.processedBy = user.id;
    return this.createSaleUseCase.execute(createSaleDto);
  }

  @Version('1')
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async search(@Query() filters: SalesFilterDto) {
    return this.getSaleUseCase.search(filters, filters.page, filters.limit);
  }

  @Version('1')
  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getTodaySales() {
    return this.getSaleUseCase.getTodaySales();
  }

  @Version('1')
  @Get('report')
  @Roles(UserRole.ADMIN)
  async getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesReportUseCase.execute(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Version('1')
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findOne(@Param('id') id: string) {
    return this.getSaleUseCase.getById(id);
  }

  @Version('1')
  @Get('number/:saleNumber')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findBySaleNumber(@Param('saleNumber') saleNumber: string) {
    return this.getSaleUseCase.getBySaleNumber(saleNumber);
  }

  @Version('1')
  @Get('member/:memberId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getMemberPurchaseHistory(@Param('memberId') memberId: string) {
    return this.getSaleUseCase.getMemberPurchaseHistory(memberId);
  }

  @Version('1')
  @Post(':id/refund')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async processRefund(
    @Param('id') id: string,
    @Body() refundRequestDto: RefundRequestDto,
    @CurrentUser() user: IAuthUser,
  ) {
    refundRequestDto.processedBy = user.id;
    return this.processRefundUseCase.execute(id, refundRequestDto);
  }

  @Version('1')
  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async cancelSale(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.cancelSaleUseCase.execute(id, reason);
  }
}
