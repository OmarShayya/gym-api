import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export enum StockOperation {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
}

export class UpdateStockDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsEnum(StockOperation)
  operation: StockOperation;
}
