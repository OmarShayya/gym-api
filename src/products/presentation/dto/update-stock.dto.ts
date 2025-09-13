import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StockOperation } from '../../domain/enums/product.enum';

export class UpdateStockDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsEnum(StockOperation)
  operation: StockOperation;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkStockUpdateDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsEnum(StockOperation)
  operation: StockOperation;

  @IsOptional()
  @IsString()
  reason?: string;
}
