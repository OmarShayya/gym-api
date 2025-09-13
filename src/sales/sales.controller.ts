import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('memberId') memberId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.salesService.findAll(start, end, memberId);
  }

  @Get('today')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getTodaysSales() {
    return this.salesService.getTodaysSales();
  }

  @Get('report')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    return this.salesService.getSalesReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('member/:memberId')
  getMemberPurchaseHistory(@Param('memberId') memberId: string) {
    return this.salesService.getMemberPurchaseHistory(memberId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get('by-number/:saleNumber')
  findBySaleNumber(@Param('saleNumber') saleNumber: string) {
    return this.salesService.findBySaleNumber(saleNumber);
  }
}
