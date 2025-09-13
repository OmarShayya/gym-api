import { Injectable, Logger } from '@nestjs/common';
import { DayPassRepository } from '../../infrastructure/repositories/day-pass.repository';
import {
  ResourceNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/business-exceptions';

@Injectable()
export class DeleteDayPassUseCase {
  private readonly logger = new Logger(DeleteDayPassUseCase.name);

  constructor(private readonly dayPassRepository: DayPassRepository) {}

  async execute(id: string): Promise<void> {
    const dayPass = await this.dayPassRepository.findById(id);
    if (!dayPass) {
      throw new ResourceNotFoundException('Day Pass', id);
    }

    if (dayPass.status === 'used') {
      throw new InvalidOperationException('Cannot delete a used day pass');
    }

    const deleted = await this.dayPassRepository.delete(id);
    if (!deleted) {
      throw new ResourceNotFoundException('Day Pass', id);
    }

    this.logger.log(`Day pass deleted: ${dayPass.passId}`);
  }
}
