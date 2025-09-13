import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ProductCategory,
  ProductStatus,
} from '../../domain/enums/product.enum';

const transformStringToNumber = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

const transformStringToInteger = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
};

const transformStringToBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

const transformStringToArray = (value: any): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return undefined;
};

class DimensionsDto {
  @Transform(({ value }) => transformStringToNumber(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @Transform(({ value }) => transformStringToNumber(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @Transform(({ value }) => transformStringToNumber(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsString()
  unit?: 'cm' | 'inch';
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.toUpperCase().trim())
  sku: string;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @Transform(({ value }) => transformStringToNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Transform(({ value }) => transformStringToInteger(value))
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  stock: number;

  @IsOptional()
  @Transform(({ value }) => transformStringToNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @Transform(({ value }) => transformStringToNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @Transform(({ value }) => transformStringToNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  memberPrice?: number;

  @IsOptional()
  @Transform(({ value }) => transformStringToNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @Transform(({ value }) => transformStringToInteger(value))
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @Transform(({ value }) => transformStringToArray(value))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => transformStringToNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
