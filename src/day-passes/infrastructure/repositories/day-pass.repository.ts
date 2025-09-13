import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DayPass, DayPassDocument } from '../schemas/day-pass.schema';
import { IDayPassRepository } from '../../domain/repositories/day-pass.repository.interface';
import {
  IDayPassSearchFilters,
  IDayPassSearchResult,
} from '../../domain/interfaces/day-pass.interface';
import { DayPassStatus } from '../../domain/enums/day-pass.enum';

@Injectable()
export class DayPassRepository implements IDayPassRepository {
  constructor(
    @InjectModel(DayPass.name)
    private readonly dayPassModel: Model<DayPassDocument>,
  ) {}

  async create(data: any): Promise<DayPassDocument> {
    const dayPass = new this.dayPassModel(data);
    return dayPass.save();
  }

  async findById(id: string): Promise<DayPassDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.dayPassModel.findById(id).exec();
  }

  async findByPassId(passId: string): Promise<DayPassDocument | null> {
    return this.dayPassModel.findOne({ passId }).exec();
  }

  async findByQrCode(qrCode: string): Promise<DayPassDocument | null> {
    return this.dayPassModel
      .findOne({
        $or: [{ qrCode }, { passId: qrCode }],
      })
      .exec();
  }

  async findAll(): Promise<DayPassDocument[]> {
    return this.dayPassModel.find().sort({ createdAt: -1 }).exec();
  }

  async search(
    filters: IDayPassSearchFilters,
    page: number,
    limit: number,
  ): Promise<IDayPassSearchResult> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    if (filters.startDate && filters.endDate) {
      query.validDate = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { passId: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [passes, total] = await Promise.all([
      this.dayPassModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.dayPassModel.countDocuments(query).exec(),
    ]);

    return {
      passes: passes.map((p) => this.toPlainObject(p)),
      total,
      page,
      limit,
      hasMore: skip + passes.length < total,
    };
  }

  async update(id: string, data: any): Promise<DayPassDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.dayPassModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateStatus(
    id: string,
    status: DayPassStatus,
  ): Promise<DayPassDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const updateData: any = { status };
    if (status === DayPassStatus.USED) {
      updateData.usedAt = new Date();
    }
    return this.dayPassModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.dayPassModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findTodayPasses(): Promise<DayPassDocument[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.dayPassModel
      .find({
        validDate: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findExpiredPasses(): Promise<DayPassDocument[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.dayPassModel
      .find({
        validDate: { $lt: today },
        status: DayPassStatus.ACTIVE,
      })
      .exec();
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<DayPassDocument[]> {
    return this.dayPassModel
      .find({
        validDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ validDate: 1 })
      .exec();
  }

  async countByStatus(status?: DayPassStatus): Promise<number> {
    const query = status ? { status } : {};
    return this.dayPassModel.countDocuments(query).exec();
  }

  async getStatistics(startDate: Date, endDate: Date): Promise<any> {
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          averagePrice: { $avg: '$amount' },
          byStatus: {
            $push: '$status',
          },
          byType: {
            $push: '$type',
          },
          byPaymentMethod: {
            $push: '$paymentMethod',
          },
        },
      },
    ];

    const results = await this.dayPassModel.aggregate(pipeline).exec();
    return results[0] || null;
  }

  async bulkUpdateStatus(
    ids: string[],
    status: DayPassStatus,
  ): Promise<number> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const result = await this.dayPassModel
      .updateMany({ _id: { $in: validIds } }, { status })
      .exec();
    return result.modifiedCount;
  }

  private toPlainObject(doc: DayPassDocument): any {
    return doc.toObject();
  }
}
