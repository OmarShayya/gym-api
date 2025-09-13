import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DayPassRepository } from '../../infrastructure/repositories/day-pass.repository';
import { DayPassMapper } from '../../infrastructure/mappers/day-pass.mapper';
import { DayPassStatus } from '../../domain/enums/day-pass.enum';

@Injectable()
export class ExpirePassesUseCase {
  private readonly logger = new Logger(ExpirePassesUseCase.name);

  constructor(
    private readonly dayPassRepository: DayPassRepository,
    private readonly dayPassMapper: DayPassMapper,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async expireOldPasses(): Promise<void> {
    try {
      const expiredPasses = await this.dayPassRepository.findExpiredPasses();

      if (expiredPasses.length === 0) {
        return;
      }

      this.logger.log(`Found ${expiredPasses.length} passes to expire`);

      const passIds = expiredPasses.map((pass) => pass._id.toString());
      const updated = await this.dayPassRepository.bulkUpdateStatus(
        passIds,
        DayPassStatus.EXPIRED,
      );

      this.logger.log(`Expired ${updated} day passes`);
    } catch (error) {
      this.logger.error(`Failed to expire passes: ${error.message}`);
    }
  }

  async manualExpire(passId: string): Promise<void> {
    const dayPass = await this.dayPassRepository.findByPassId(passId);
    if (!dayPass) {
      throw new Error(`Day pass ${passId} not found`);
    }

    const entity = this.dayPassMapper.toEntity(dayPass);

    if (!entity.shouldExpire) {
      throw new Error('Day pass cannot be expired');
    }

    entity.expire();

    await this.dayPassRepository.updateStatus(
      dayPass._id.toString(),
      entity.status,
    );

    this.logger.log(`Manually expired day pass: ${passId}`);
  }
}
