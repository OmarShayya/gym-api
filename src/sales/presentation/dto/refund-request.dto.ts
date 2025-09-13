import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { RefundReason } from '../../domain/enums/sale.enum';

export class RefundItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class RefundRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  items: RefundItemDto[];

  @IsNotEmpty()
  @IsEnum(RefundReason)
  reason: RefundReason;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  processedBy?: string;
}
