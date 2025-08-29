/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  MaxLength,
  ValidateNested,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Helper function to transform string values to numbers
const transformStringToNumber = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

// Helper function to transform string values to integers
const transformStringToInteger = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
};

// Helper function to transform string to boolean
const transformStringToBoolean = (value: any): boolean | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

// Helper function to transform string to array
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
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => transformStringToNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @Transform(({ value }) => transformStringToInteger(value))
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  stock?: number;

  @IsOptional()
  @Transform(({ value }) => transformStringToBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

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
  @Transform(({ value }) => transformStringToInteger(value))
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;

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
  @Max(100)
  discountPercentage?: number;
}
