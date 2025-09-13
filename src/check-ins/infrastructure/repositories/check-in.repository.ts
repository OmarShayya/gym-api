import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CheckIn, CheckInDocument } from '../schemas/check-in.schema';
import { ICheckInRepository } from '../../domain/repositories/check-in.repository.interface';
import { ICheckInFilters } from '../../domain/interfaces/check-in.interface';
import { CheckInStatus } from '../../domain/enums/check-in.enum';

@Injectable()
export class CheckInRepository implements ICheckInRepository {
  constructor(
    @InjectModel(CheckIn.name)
    private readonly checkInModel: Model<CheckInDocument>,
  ) {}

  async create(data: any): Promise<CheckInDocument> {
    const checkIn = new this.checkInModel(data);
    return checkIn.save();
  }

  async findById(id: string): Promise<CheckInDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.checkInModel.findById(id).populate('memberId').exec();
  }

  async findActiveByMemberId(
    memberId: string,
  ): Promise<CheckInDocument | null> {
    if (!Types.ObjectId.isValid(memberId)) {
      return null;
    }
    return this.checkInModel
      .findOne({
        memberId: new Types.ObjectId(memberId),
        status: CheckInStatus.ACTIVE,
      })
      .exec();
  }

  async findActiveByDayPassId(
    dayPassId: string,
  ): Promise<CheckInDocument | null> {
    return this.checkInModel
      .findOne({
        dayPassId,
        status: CheckInStatus.ACTIVE,
      })
      .exec();
  }

  async findByFilters(
    filters: ICheckInFilters,
    limit?: number,
  ): Promise<CheckInDocument[]> {
    const query: any = {};

    if (filters.memberId && Types.ObjectId.isValid(filters.memberId)) {
      query.memberId = new Types.ObjectId(filters.memberId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.method) {
      query.method = filters.method;
    }

    if (filters.startDate && filters.endDate) {
      query.checkInTime = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    const queryBuilder = this.checkInModel
      .find(query)
      .populate('memberId')
      .sort({ checkInTime: -1 });

    if (limit) {
      queryBuilder.limit(limit);
    }

    return queryBuilder.exec();
  }

  async findActiveCheckIns(): Promise<CheckInDocument[]> {
    return this.checkInModel
      .find({ status: CheckInStatus.ACTIVE })
      .populate('memberId')
      .sort({ checkInTime: -1 })
      .exec();
  }

  async findCheckInsToAutoCheckout(
    beforeTime: Date,
  ): Promise<CheckInDocument[]> {
    return this.checkInModel
      .find({
        status: CheckInStatus.ACTIVE,
        autoCheckout: true,
        scheduledCheckoutTime: { $lte: beforeTime },
      })
      .exec();
  }

  async findTodayCheckIns(): Promise<CheckInDocument[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.checkInModel
      .find({
        checkInTime: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate('memberId')
      .sort({ checkInTime: -1 })
      .exec();
  }

  async findMemberCheckIns(
    memberId: string,
    limit?: number,
  ): Promise<CheckInDocument[]> {
    if (!Types.ObjectId.isValid(memberId)) {
      return [];
    }

    const query = this.checkInModel
      .find({ memberId: new Types.ObjectId(memberId) })
      .sort({ checkInTime: -1 });

    if (limit) {
      query.limit(limit);
    }

    return query.exec();
  }

  async update(id: string, data: any): Promise<CheckInDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.checkInModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('memberId')
      .exec();
  }

  async updateStatus(
    id: string,
    status: CheckInStatus,
  ): Promise<CheckInDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.checkInModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('memberId')
      .exec();
  }

  async countTodayCheckIns(memberId?: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      checkInTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    if (memberId && Types.ObjectId.isValid(memberId)) {
      query.memberId = new Types.ObjectId(memberId);
    }

    return this.checkInModel.countDocuments(query).exec();
  }

  async getStatistics(startDate: Date, endDate: Date): Promise<any> {
    const pipeline = [
      {
        $match: {
          checkInTime: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageDuration: { $avg: '$duration' },
          byMethod: {
            $push: '$method',
          },
          byType: {
            $push: '$type',
          },
          byHour: {
            $push: { $hour: '$checkInTime' },
          },
        },
      },
    ];

    const results = await this.checkInModel.aggregate(pipeline).exec();
    return results[0] || null;
  }
}
