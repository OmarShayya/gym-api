import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckInRepository } from '../../infrastructure/repositories/check-in.repository';
import { CheckInMapper } from '../../infrastructure/mappers/check-in.mapper';
import { CheckInStatus } from '../../domain/enums/check-in.enum';

@Injectable()
export class AutoCheckoutService {
  private readonly logger = new Logger(AutoCheckoutService.name);

  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly checkInMapper: CheckInMapper,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processAutoCheckouts(): Promise<void> {
    try {
      const now = new Date();
      const checkInsToProcess =
        await this.checkInRepository.findCheckInsToAutoCheckout(now);

      if (checkInsToProcess.length === 0) {
        return;
      }

      this.logger.log(`Processing ${checkInsToProcess.length} auto-checkouts`);

      for (const checkIn of checkInsToProcess) {
        try {
          await this.autoCheckout(checkIn._id.toString());
        } catch (error) {
          this.logger.error(
            `Failed to auto-checkout check-in ${checkIn._id}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Auto-checkout process failed: ${error.message}`);
    }
  }

  async autoCheckout(checkInId: string): Promise<void> {
    const checkIn = await this.checkInRepository.findById(checkInId);

    if (!checkIn) {
      throw new Error(`Check-in ${checkInId} not found`);
    }

    const entity = this.checkInMapper.toEntity(checkIn);

    if (!entity.shouldAutoCheckout) {
      return;
    }

    entity.autoCheckOut();

    await this.checkInRepository.update(checkInId, {
      checkOutTime: entity.checkOutTime,
      duration: entity.duration,
      status: entity.status,
      notes:
        `${entity.notes || ''}\nAuto-checkout at ${entity.checkOutTime.toISOString()}`.trim(),
    });

    this.logger.log(
      `Auto-checked out ${entity.type} ${entity.memberId || entity.dayPassId}`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredCheckIns(): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const expiredCheckIns = await this.checkInRepository.findByFilters({
        status: CheckInStatus.ACTIVE,
        endDate: yesterday,
      });

      if (expiredCheckIns.length > 0) {
        this.logger.log(
          `Cleaning up ${expiredCheckIns.length} expired check-ins`,
        );

        for (const checkIn of expiredCheckIns) {
          await this.checkInRepository.updateStatus(
            checkIn._id.toString(),
            CheckInStatus.EXPIRED,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Cleanup process failed: ${error.message}`);
    }
  }
}
