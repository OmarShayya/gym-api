import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { SearchMembersDto } from './dto/search-members.dto';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<MemberDocument> {
    const existingMember = await this.memberModel
      .findOne({
        email: createMemberDto.email,
      })
      .exec();

    if (existingMember) {
      throw new ConflictException('Member with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);
    const memberId = this.generateMemberId();
    const qrCodeData = await this.generateQRCode(memberId);

    const createdMember = new this.memberModel({
      ...createMemberDto,
      password: hashedPassword,
      memberId,
      qrCode: qrCodeData,
    });

    return createdMember.save();
  }

  async findAll(): Promise<MemberDocument[]> {
    return this.memberModel.find().select('-password').exec();
  }

  async search(searchDto: SearchMembersDto): Promise<{
    members: MemberDocument[];
    total: number;
    hasMore: boolean;
  }> {
    const { search, status, limit = 50, offset = 0 } = searchDto;

    // Build the query
    const query: any = {};

    // Add status filter if provided
    if (status) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.$or = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
        { memberId: { $regex: searchRegex } },
      ];
    }

    // Execute search with pagination
    const [members, total] = await Promise.all([
      this.memberModel
        .find(query)
        .select('-password')
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(offset)
        .limit(limit)
        .exec(),
      this.memberModel.countDocuments(query).exec(),
    ]);

    const hasMore = offset + members.length < total;

    return {
      members,
      total,
      hasMore,
    };
  }

  async findOne(id: string): Promise<MemberDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid member ID');
    }

    const member = await this.memberModel
      .findById(id)
      .select('-password')
      .exec();
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async findByEmail(email: string): Promise<MemberDocument | null> {
    return this.memberModel.findOne({ email }).exec();
  }

  async findByMemberId(memberId: string): Promise<MemberDocument> {
    const member = await this.memberModel.findOne({ memberId }).exec();
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async findByQrCode(qrCode: string): Promise<MemberDocument> {
    const member = await this.memberModel.findOne({ memberId: qrCode }).exec();
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
  ): Promise<MemberDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid member ID');
    }

    const updatedMember = await this.memberModel
      .findByIdAndUpdate(id, updateMemberDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedMember) {
      throw new NotFoundException('Member not found');
    }
    return updatedMember;
  }

  async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended',
  ): Promise<MemberDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid member ID');
    }

    const updatedMember = await this.memberModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('-password')
      .exec();

    if (!updatedMember) {
      throw new NotFoundException('Member not found');
    }
    return updatedMember;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid member ID');
    }

    const result = await this.memberModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Member not found');
    }
  }

  // Analytics methods
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    expiring: number;
  }> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const [total, active, inactive, suspended, expiring] = await Promise.all([
      this.memberModel.countDocuments().exec(),
      this.memberModel.countDocuments({ status: 'active' }).exec(),
      this.memberModel.countDocuments({ status: 'inactive' }).exec(),
      this.memberModel.countDocuments({ status: 'suspended' }).exec(),
      this.memberModel
        .countDocuments({
          status: 'active',
          membershipEndDate: {
            $gte: now,
            $lte: thirtyDaysFromNow,
          },
        })
        .exec(),
    ]);

    return {
      total,
      active,
      inactive,
      suspended,
      expiring,
    };
  }

  private generateMemberId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `GYM${timestamp}${random}`;
  }

  private async generateQRCode(memberId: string): Promise<string> {
    try {
      const qrCodeData = await QRCode.toDataURL(memberId);
      return qrCodeData;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }
}
