import { Injectable, Logger } from '@nestjs/common';
import { DayPassRepository } from '../../infrastructure/repositories/day-pass.repository';
import { DayPassMapper } from '../../infrastructure/mappers/day-pass.mapper';
import { IDayPass } from '../../domain/interfaces/day-pass.interface';
import { DayPassStatus } from '../../domain/enums/day-pass.enum';
import {
  ResourceNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class UseDayPassUseCase {
  private readonly logger = new Logger(UseDayPassUseCase.name);

  constructor(
    private readonly dayPassRepository: DayPassRepository,
    private readonly dayPassMapper: DayPassMapper,
  ) {}

  async execute(passId: string): Promise<IDayPass> {
    const dayPass = await this.dayPassRepository.findByPassId(passId);
    if (!dayPass) {
      throw new ResourceNotFoundException('Day Pass', passId);
    }

    const entity = this.dayPassMapper.toEntity(dayPass);

    if (entity.isUsed) {
      throw new InvalidOperationException('Day pass has already been used');
    }

    if (entity.isExpired) {
      throw new InvalidOperationException('Day pass has expired');
    }

    if (entity.isCancelled) {
      throw new InvalidOperationException('Day pass has been cancelled');
    }

    if (!entity.isValidForToday) {
      if (entity.isValidForFuture) {
        throw new InvalidOperationException('Day pass is not valid yet');
      } else {
        throw new InvalidOperationException('Day pass has expired');
      }
    }

    entity.use();

    const updatedPass = await this.dayPassRepository.update(
      dayPass._id.toString(),
      {
        status: entity.status,
        usedAt: entity.usedAt,
      },
    );

    if (!updatedPass) {
      throw new ResourceNotFoundException('Day Pass', passId);
    }

    this.logger.log(`Day pass used: ${passId}`);

    return this.dayPassMapper.toDTOFromDocument(updatedPass);
  }
}
