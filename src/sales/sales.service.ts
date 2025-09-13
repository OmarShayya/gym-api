import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Sale, SaleDocument, SaleItem } from './schemas/sale.schema';
import { MembersService } from '../members/members.service';
import { ProductsService } from '../products/products.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { MemberDocument } from '../members/infrastructure/schemas/member.schema';
import { SalesReportResponse } from './types/sale.types';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    private readonly membersService: MembersService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<SaleResponseDto> {
    // Validate member
    const member = await this.membersService.findByMemberId(
      createSaleDto.memberId,
    );

    if (member.status !== 'active') {
      throw new BadRequestException('Member account is not active');
    }

    // Process items and calculate total
    const saleItems: SaleItem[] = [];
    let total = 0;

    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product.isActive) {
        throw new BadRequestException(
          `Product ${product.name} is not available`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const subtotal = product.price * item.quantity;

      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      total += subtotal;

      // Decrement stock
      await this.productsService.decrementStock(product._id, item.quantity);
    }

    // Generate sale number
    const saleNumber = this.generateSaleNumber();

    // Create sale
    const sale = new this.saleModel({
      memberId: member._id,
      items: saleItems,
      total,
      paymentMethod: createSaleDto.paymentMethod,
      notes: createSaleDto.notes,
      saleNumber,
    });

    const savedSale = await sale.save();

    return this.formatSaleResponse(savedSale, member);
  }

  async findAll(
    startDate?: Date,
    endDate?: Date,
    memberId?: string,
  ): Promise<SaleResponseDto[]> {
    const filter: FilterQuery<SaleDocument> = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (memberId) {
      const member = await this.membersService.findByMemberId(memberId);
      filter.memberId = member._id;
    }

    const sales = await this.saleModel
      .find(filter)
      .populate('memberId')
      .sort({ createdAt: -1 })
      .exec();

    const salesWithPopulatedMember = sales.filter(
      (sale) =>
        sale.memberId &&
        typeof sale.memberId === 'object' &&
        'firstName' in sale.memberId,
    );

    return salesWithPopulatedMember.map((sale) => {
      const member = sale.memberId;
      return {
        id: sale._id.toString(),
        saleNumber: sale.saleNumber,
        memberId:
          typeof member === 'object' && 'memberId' in member
            ? String(member.memberId)
            : String(member),
        memberName:
          typeof member === 'object' &&
          'firstName' in member &&
          'lastName' in member
            ? `${(member as unknown as MemberDocument).firstName} ${(member as unknown as MemberDocument).lastName}`
            : '',
        items: sale.items.map((item) => ({
          productId: item.productId.toString(),
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        notes: sale.notes,
        createdAt: sale.createdAt || new Date(),
      };
    });
  }

  async findOne(id: string): Promise<SaleResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid sale ID');
    }

    const sale = await this.saleModel.findById(id).populate('memberId').exec();

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (
      !sale.memberId ||
      typeof sale.memberId !== 'object' ||
      !('firstName' in sale.memberId)
    ) {
      throw new NotFoundException('Sale member data not found');
    }

    const member = sale.memberId as unknown as MemberDocument;

    return {
      id: sale._id.toString(),
      saleNumber: sale.saleNumber,
      memberId: member.memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      items: sale.items.map((item) => ({
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes,
      createdAt: sale.createdAt || new Date(),
    };
  }

  async findBySaleNumber(saleNumber: string): Promise<SaleResponseDto> {
    const sale = await this.saleModel
      .findOne({ saleNumber })
      .populate('memberId')
      .exec();

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (
      !sale.memberId ||
      typeof sale.memberId !== 'object' ||
      !('firstName' in sale.memberId)
    ) {
      throw new NotFoundException('Sale member data not found');
    }

    const member = sale.memberId as unknown as MemberDocument;

    return {
      id: sale._id.toString(),
      saleNumber: sale.saleNumber,
      memberId: member.memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      items: sale.items.map((item) => ({
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes,
      createdAt: sale.createdAt || new Date(),
    };
  }

  async getMemberPurchaseHistory(memberId: string): Promise<SaleResponseDto[]> {
    const member = await this.membersService.findByMemberId(memberId);

    const sales = await this.saleModel
      .find({ memberId: member._id })
      .sort({ createdAt: -1 })
      .exec();

    return sales.map((sale) => this.formatSaleResponse(sale, member));
  }

  async getTodaysSales(): Promise<SaleResponseDto[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.saleModel
      .find({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate('memberId')
      .sort({ createdAt: -1 })
      .exec();

    const salesWithPopulatedMember = sales.filter(
      (sale) =>
        sale.memberId &&
        typeof sale.memberId === 'object' &&
        'firstName' in sale.memberId,
    );

    return salesWithPopulatedMember.map((sale) => {
      const member = sale.memberId as unknown as MemberDocument;
      return {
        id: sale._id.toString(),
        saleNumber: sale.saleNumber,
        memberId: member.memberId,
        memberName: `${member.firstName} ${member.lastName}`,
        items: sale.items.map((item) => ({
          productId: item.productId.toString(),
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        notes: sale.notes,
        createdAt: sale.createdAt || new Date(),
      };
    });
  }

  async getSalesReport(
    startDate: Date,
    endDate: Date,
  ): Promise<SalesReportResponse> {
    const sales = await this.saleModel
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .exec();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    const productSales = new Map<
      string,
      { quantity: number; revenue: number }
    >();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.productName;
        const existing = productSales.get(key) || { quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        productSales.set(key, existing);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalSales,
      totalRevenue,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      topProducts,
      period: {
        startDate,
        endDate,
      },
    };
  }

  private generateSaleNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SALE${timestamp}${random}`;
  }

  private formatSaleResponse(
    sale: SaleDocument,
    member: MemberDocument,
  ): SaleResponseDto {
    return {
      id: sale._id.toString(),
      saleNumber: sale.saleNumber,
      memberId: member.memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      items: sale.items.map((item) => ({
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes,
      createdAt: sale.createdAt || new Date(),
    };
  }
}
