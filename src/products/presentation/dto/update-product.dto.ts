import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['sku', 'createdBy'] as const),
) {
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;
}
