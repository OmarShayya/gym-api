import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DayPass, DayPassDocument } from './schemas/day-pass.schema';
import { CreateDayPassDto } from './dto/create-day-pass.dto';
import { UpdateDayPassDto } from './dto/update-day-pass.dto';
import { DayPassResponseDto } from './dto/day-pass-response.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class DayPassesService {
  constructor(
    @InjectModel(DayPass.name) private dayPassModel: Model<DayPassDocument>,
  ) {}

  async create(
    createDayPassDto: CreateDayPassDto,
  ): Promise<DayPassResponseDto> {
    const passId = this.generatePassId();
    const qrCode = await this.generateQRCode(passId);

    const validDate = new Date(createDayPassDto.validDate);

    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (validDate < today) {
      throw new BadRequestException('Valid date cannot be in the past');
    }

    const dayPass = new this.dayPassModel({
      ...createDayPassDto,
      passId,
      qrCode,
      validDate,
    });

    const savedPass = await dayPass.save();
    return this.toResponseDto(savedPass);
  }

  async findAll(): Promise<DayPassResponseDto[]> {
    const dayPasses = await this.dayPassModel.find().exec();
    return dayPasses.map((pass) => this.toResponseDto(pass));
  }

  async findOne(id: string): Promise<DayPassResponseDto> {
    const dayPass = await this.dayPassModel.findById(id).exec();
    if (!dayPass) {
      throw new NotFoundException(`Day pass with ID ${id} not found`);
    }
    return this.toResponseDto(dayPass);
  }

  async findByPassId(passId: string): Promise<DayPassResponseDto> {
    const dayPass = await this.dayPassModel.findOne({ passId }).exec();
    if (!dayPass) {
      throw new NotFoundException(`Day pass with pass ID ${passId} not found`);
    }
    return this.toResponseDto(dayPass);
  }

  async findByQrCode(qrCode: string): Promise<DayPassResponseDto> {
    const dayPass = await this.dayPassModel.findOne({ qrCode }).exec();
    if (!dayPass) {
      throw new NotFoundException(`Day pass with QR code not found`);
    }
    return this.toResponseDto(dayPass);
  }

  async update(
    id: string,
    updateDayPassDto: UpdateDayPassDto,
  ): Promise<DayPassResponseDto> {
    const dayPass = await this.dayPassModel
      .findByIdAndUpdate(id, updateDayPassDto, { new: true })
      .exec();

    if (!dayPass) {
      throw new NotFoundException(`Day pass with ID ${id} not found`);
    }

    return this.toResponseDto(dayPass);
  }

  async remove(id: string): Promise<void> {
    const result = await this.dayPassModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Day pass with ID ${id} not found`);
    }
  }

  async useDayPass(passId: string): Promise<DayPassResponseDto> {
    const dayPass = await this.dayPassModel.findOne({ passId }).exec();

    if (!dayPass) {
      throw new NotFoundException(`Day pass with pass ID ${passId} not found`);
    }

    if (dayPass.status === 'used') {
      throw new BadRequestException('Day pass has already been used');
    }

    if (dayPass.status === 'expired') {
      throw new BadRequestException('Day pass has expired');
    }

    // Check if the pass is valid for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(dayPass.validDate);
    validDate.setHours(0, 0, 0, 0);

    if (validDate.getTime() !== today.getTime()) {
      // If the date has passed, mark as expired
      if (validDate < today) {
        dayPass.status = 'expired';
        await dayPass.save();
        throw new BadRequestException('Day pass has expired');
      }

      // If the date is in the future
      throw new BadRequestException('Day pass is not valid for today');
    }

    // Mark as used
    dayPass.status = 'used';
    dayPass.usedAt = new Date();
    await dayPass.save();

    return this.toResponseDto(dayPass);
  }

  async getTodaysPasses(): Promise<DayPassResponseDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayPasses = await this.dayPassModel
      .find({
        validDate: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .exec();

    return dayPasses.map((pass) => this.toResponseDto(pass));
  }

  async getExpiredPasses(): Promise<DayPassResponseDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayPasses = await this.dayPassModel
      .find({
        validDate: { $lt: today },
        status: { $ne: 'expired' },
      })
      .exec();

    // Update all expired passes
    await this.dayPassModel.updateMany(
      {
        validDate: { $lt: today },
        status: { $ne: 'expired' },
      },
      { status: 'expired' },
    );

    return dayPasses.map((pass) => this.toResponseDto(pass));
  }

  private generatePassId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `DP-${timestamp}-${randomPart}`.toUpperCase();
  }

  private async generateQRCode(passId: string): Promise<string> {
    try {
      return await QRCode.toDataURL(passId);
    } catch {
      throw new Error('Failed to generate QR code');
    }
  }

  private toResponseDto(dayPass: DayPassDocument): DayPassResponseDto {
    return {
      id: dayPass._id.toString(),
      firstName: dayPass.firstName,
      lastName: dayPass.lastName,
      email: dayPass.email,
      phone: dayPass.phone,
      passId: dayPass.passId,
      qrCode: dayPass.qrCode,
      validDate: dayPass.validDate,
      paymentMethod: dayPass.paymentMethod,
      amount: dayPass.amount,
      status: dayPass.status,
      usedAt: dayPass.usedAt,
      notes: dayPass.notes,
      createdAt: dayPass.createdAt,
      updatedAt: dayPass.updatedAt,
    };
  }
}
