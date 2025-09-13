import { Injectable, Logger } from '@nestjs/common';
import { DayPassRepository } from '../../infrastructure/repositories/day-pass.repository';
import { DayPassMapper } from '../../infrastructure/mappers/day-pass.mapper';
import { DayPassService } from '../services/day-pass.service';
import { CreateDayPassDto } from '../../presentation/dto/create-day-pass.dto';
import { IDayPass } from '../../domain/interfaces/day-pass.interface';
import { DayPassType, PaymentMethod } from '../../domain/enums/day-pass.enum';
import { InvalidOperationException } from '../../../common/exceptions/business-exceptions';

@Injectable()
export class CreateDayPassUseCase {
  private readonly logger = new Logger(CreateDayPassUseCase.name);

  constructor(
    private readonly dayPassRepository: DayPassRepository,
    private readonly dayPassMapper: DayPassMapper,
    private readonly dayPassService: DayPassService,
  ) {}

  async execute(dto: CreateDayPassDto): Promise<IDayPass> {
    const validDate = new Date(dto.validDate);

    if (!this.dayPassService.validateFutureDate(validDate)) {
      throw new InvalidOperationException(
        'Valid date must be today or within the next 30 days',
      );
    }

    const passId = this.dayPassService.generatePassId();
    const qrCode = await this.dayPassService.generateQRCode(passId);

    const dayPassData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      passId,
      qrCode,
      validDate,
      type: dto.type || DayPassType.SINGLE,
      paymentMethod: dto.paymentMethod || PaymentMethod.CASH,
      amount: dto.amount,
      numberOfPeople: dto.numberOfPeople || 1,
      notes: dto.notes,
      createdBy: dto.createdBy,
    };

    const createdPass = await this.dayPassRepository.create(dayPassData);

    this.logger.log(
      `Day pass created: ${passId} for ${dto.firstName} ${dto.lastName}`,
    );

    return this.dayPassMapper.toDTOFromDocument(createdPass);
  }
}
