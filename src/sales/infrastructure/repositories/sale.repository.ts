import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from '../schemas/sale.schema';
import { ISaleRepository } from '../../domain/repositories/sale.repository.interface';
import {
  ISaleFilters,
  ISaleSearchResult,
} from '../../domain/interfaces/sale.interface';
import { SaleStatus } from '../../domain/enums/sale.enum';

@Injectable()
export class SaleRepository implements ISaleRepository {
  constructor(
    @InjectModel(Sale.name)
    private readonly saleModel: Model<SaleDocument>,
  ) {}

  async create(data: any): Promise<SaleDocument> {
    const sale = new this.saleModel(data);
    return sale.save();
  }

  async findById(id: string): Promise<SaleDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.saleModel.findById(id).populate('memberId').exec();
  }

  async findBySaleNumber(saleNumber: string): Promise<SaleDocument | null> {
    return this.saleModel.findOne({ saleNumber }).populate('memberId').exec();
  }

  async findByMemberId(memberId: string): Promise<SaleDocument[]> {
    if (!Types.ObjectId.isValid(memberId)) {
      return [];
    }
    return this.saleModel
      .find({ memberId: new Types.ObjectId(memberId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(filters?: ISaleFilters): Promise<SaleDocument[]> {
    const query: any = {};

    if (filters?.memberId && Types.ObjectId.isValid(filters.memberId)) {
      query.memberId = new Types.ObjectId(filters.memberId);
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    if (filters?.startDate && filters?.endDate) {
      query.createdAt = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    return this.saleModel
      .find(query)
      .populate('memberId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<any[]> {
    return this.saleModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: SaleStatus.COMPLETED,
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: {
              productId: '$items.productId',
              productName: '$items.productName',
            },
            quantitySold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.subtotal' },
          },
        },
        {
          $project: {
            productId: '$_id.productId',
            productName: '$_id.productName',
            quantitySold: 1,
            revenue: 1,
            averagePrice: { $divide: ['$revenue', '$quantitySold'] },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: limit },
      ])
      .exec();
  }

  async getTopCustomers(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<any[]> {
    return this.saleModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: SaleStatus.COMPLETED,
          },
        },
        {
          $lookup: {
            from: 'members',
            localField: 'memberId',
            foreignField: '_id',
            as: 'member',
          },
        },
        { $unwind: '$member' },
        {
          $group: {
            _id: '$memberId',
            memberName: {
              $first: {
                $concat: ['$member.firstName', ' ', '$member.lastName'],
              },
            },
            totalPurchases: { $sum: 1 },
            totalSpent: { $sum: '$total' },
          },
        },
        {
          $project: {
            memberId: '$_id',
            memberName: 1,
            totalPurchases: 1,
            totalSpent: 1,
            averageOrderValue: { $divide: ['$totalSpent', '$totalPurchases'] },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: limit },
      ])
      .exec();
  }

  async getDailySales(startDate: Date, endDate: Date): Promise<any[]> {
    return this.saleModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: SaleStatus.COMPLETED,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            sales: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
        {
          $project: {
            date: '$_id',
            sales: 1,
            revenue: 1,
            transactions: '$sales',
          },
        },
        { $sort: { date: 1 } },
      ])
      .exec();
  }

  async search(
    filters: ISaleFilters,
    page: number,
    limit: number,
  ): Promise<ISaleSearchResult> {
    const query: any = this.buildQuery(filters);
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      this.saleModel
        .find(query)
        .populate('memberId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.saleModel.countDocuments(query).exec(),
    ]);

    return {
      sales: sales.map((s) => this.toPlainObject(s)),
      total,
      page,
      limit,
      hasMore: skip + sales.length < total,
    };
  }

  async update(id: string, data: any): Promise<SaleDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.saleModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('memberId')
      .exec();
  }

  async updateStatus(
    id: string,
    status: SaleStatus,
  ): Promise<SaleDocument | null> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.saleModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findTodaySales(): Promise<SaleDocument[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.saleModel
      .find({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate('memberId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<SaleDocument[]> {
    return this.saleModel
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('memberId')
      .exec();
  }

  async getStatistics(startDate: Date, endDate: Date): Promise<any> {
    return this.saleModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            averageSaleValue: { $avg: '$total' },
          },
        },
      ])
      .exec();
  }

  private buildQuery(filters: ISaleFilters): any {
    const query: any = {};

    if (filters.memberId && Types.ObjectId.isValid(filters.memberId)) {
      query.memberId = new Types.ObjectId(filters.memberId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    return query;
  }

  private toPlainObject(doc: SaleDocument): any {
    return doc.toObject({ virtuals: true });
  }
}
