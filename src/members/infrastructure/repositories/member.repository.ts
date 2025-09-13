import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member, MemberDocument } from '../schemas/member.schema';
import { IMemberRepository } from '../../domain/repositories/member.repository.interface';
import {
  IMemberFilters,
  IMemberSearchResult,
} from '../../domain/interfaces/member.interface';
import { MemberStatus } from '../../domain/enums/member-status.enum';

@Injectable()
export class MemberRepository implements IMemberRepository {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
  ) {}

  async create(data: any): Promise<MemberDocument> {
    const member = new this.memberModel(data);
    return member.save();
  }

  async findById(id: string): Promise<MemberDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.memberModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<MemberDocument | null> {
    return this.memberModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async findByMemberId(memberId: string): Promise<MemberDocument | null> {
    return this.memberModel.findOne({ memberId }).exec();
  }

  async findAll(): Promise<MemberDocument[]> {
    return this.memberModel.find().sort({ createdAt: -1 }).exec();
  }

  async search(
    filters: IMemberFilters,
    page: number,
    limit: number,
  ): Promise<IMemberSearchResult> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.membershipType) {
      query.membershipType = filters.membershipType;
    }

    if (filters.startDate && filters.endDate) {
      query.membershipEndDate = {
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
        { memberId: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.memberModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.memberModel.countDocuments(query).exec(),
    ]);

    return {
      members: members.map((m) => this.toPlainObject(m)),
      total,
      page,
      limit,
      hasMore: skip + members.length < total,
    };
  }

  async update(id: string, data: any): Promise<MemberDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.memberModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateStatus(
    id: string,
    status: MemberStatus,
  ): Promise<MemberDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.memberModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async updateLastLogin(id: string): Promise<MemberDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.memberModel
      .findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true })
      .exec();
  }

  async updateLastCheckIn(id: string): Promise<MemberDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.memberModel
      .findByIdAndUpdate(
        id,
        {
          lastCheckIn: new Date(),
          $inc: { totalCheckIns: 1 },
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.memberModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async countByStatus(status?: MemberStatus): Promise<number> {
    const query = status ? { status } : {};
    return this.memberModel.countDocuments(query).exec();
  }

  async findExpiringMemberships(days: number): Promise<MemberDocument[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.memberModel
      .find({
        status: MemberStatus.ACTIVE,
        membershipEndDate: {
          $gte: now,
          $lte: futureDate,
        },
      })
      .sort({ membershipEndDate: 1 })
      .exec();
  }

  private toPlainObject(doc: MemberDocument): any {
    const obj = doc.toObject();
    delete obj.password;
    return obj;
  }
}
