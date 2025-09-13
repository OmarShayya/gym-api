import { Injectable } from '@nestjs/common';
import { DayPassRepository } from '../../infrastructure/repositories/day-pass.repository';
import { DayPassMapper } from '../../infrastructure/mappers/day-pass.mapper';
import {
  IDayPass,
  IDayPassSearchResult,
} from '../../domain/interfaces/day-pass.interface';
import { ResourceNotFoundException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class GetDayPassUseCase {
  constructor(
    private readonly dayPassRepository: DayPassRepository,
    private readonly dayPassMapper: DayPassMapper,
  ) {}

  async getById(id: string): Promise<IDayPass> {
    const dayPass = await this.dayPassRepository.findById(id);
    if (!dayPass) {
      throw new ResourceNotFoundException('Day Pass', id);
    }
    return this.dayPassMapper.toDTOFromDocument(dayPass);
  }

  async getByPassId(passId: string): Promise<IDayPass> {
    const dayPass = await this.dayPassRepository.findByPassId(passId);
    if (!dayPass) {
      throw new ResourceNotFoundException('Day Pass', passId);
    }
    return this.dayPassMapper.toDTOFromDocument(dayPass);
  }

  async getByQrCode(qrCode: string): Promise<IDayPass> {
    const dayPass = await this.dayPassRepository.findByQrCode(qrCode);
    if (!dayPass) {
      throw new ResourceNotFoundException('Day Pass QR', qrCode);
    }
    return this.dayPassMapper.toDTOFromDocument(dayPass);
  }

  async getAll(): Promise<IDayPassSearchResult> {
    const dayPasses = await this.dayPassRepository.findAll();

    return {
      passes: dayPasses.map((pass) =>
        this.dayPassMapper.toDTOFromDocument(pass),
      ),
      total: dayPasses.length,
      page: 1,
      limit: dayPasses.length,
      hasMore: false,
    };
  }

  async getTodayPasses(): Promise<IDayPass[]> {
    const dayPasses = await this.dayPassRepository.findTodayPasses();
    return dayPasses.map((pass) => this.dayPassMapper.toDTOFromDocument(pass));
  }

  async getExpiredPasses(): Promise<IDayPass[]> {
    const dayPasses = await this.dayPassRepository.findExpiredPasses();
    return dayPasses.map((pass) => this.dayPassMapper.toDTOFromDocument(pass));
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<IDayPass[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const dayPasses = await this.dayPassRepository.findByDateRange(start, end);
    return dayPasses.map((pass) => this.dayPassMapper.toDTOFromDocument(pass));
  }
}
