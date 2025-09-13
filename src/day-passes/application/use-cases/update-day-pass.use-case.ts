import { Injectable, Logger } from '@nestjs/common';
import { DayPassRepository } from '../../infrastructure/repositories/day-pass.repository';
import { DayPassMapper } from '../../infrastructure/mappers/day-pass.mapper';
import { DayPassService } from '../services/day-pass.service';
import { UpdateDayPassDto } from '../../presentation/dto/update-day-pass.dto';
import { IDayPass } from '../../domain/interfaces/day-pass.interface';
import {
  ResourceNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class UpdateDayPassUseCase {
  private readonly logger = new Logger(UpdateDayPassUseCase.name);

  constructor(
    private readonly dayPassRepository: DayPassRepository,
    private readonly dayPassMapper: DayPassMapper,
    private readonly dayPassService: DayPassService,
  ) {}

  async execute(id: string, dto: UpdateDayPassDto): Promise<IDayPass> {
    const dayPass = await this.dayPassRepository.findById(id);
    if (!dayPass) {
      throw new ResourceNotFoundException('Day Pass', id);
    }

    if (dayPass.status === 'used') {
      throw new InvalidOperationException('Cannot update a used day pass');
    }

    const updateData: any = {};

    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.type) updateData.type = dto.type;
    if (dto.paymentMethod) updateData.paymentMethod = dto.paymentMethod;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.numberOfPeople) updateData.numberOfPeople = dto.numberOfPeople;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.validDate) {
      const newValidDate = new Date(dto.validDate);
      if (!this.dayPassService.validateFutureDate(newValidDate)) {
        throw new InvalidOperationException(
          'Valid date must be today or within the next 30 days',
        );
      }
      updateData.validDate = newValidDate;
    }

    const updatedPass = await this.dayPassRepository.update(id, updateData);
    if (!updatedPass) {
      throw new ResourceNotFoundException('Day Pass', id);
    }

    this.logger.log(`Day pass updated: ${updatedPass.passId}`);

    return this.dayPassMapper.toDTOFromDocument(updatedPass);
  }
}
