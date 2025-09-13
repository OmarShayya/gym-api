import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  ProductStatus,
  ProductCategory,
} from '../../domain/enums/product.enum';

export type ProductDocument = Product &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'products',
})
export class Product {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @Prop({ index: true })
  slug: string;

  @Prop({
    type: String,
    enum: Object.values(ProductCategory),
    required: true,
    index: true,
  })
  category: string;

  @Prop({
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.ACTIVE,
    index: true,
  })
  status: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  costPrice?: number;

  @Prop()
  salePrice?: number;

  @Prop()
  memberPrice?: number;

  @Prop({ min: 0, max: 100 })
  discountPercentage?: number;

  @Prop({ required: true, default: 0, min: 0 })
  stock: number;

  @Prop({ default: 0, min: 0 })
  reservedStock: number;

  @Prop({ default: 10, min: 0 })
  lowStockThreshold: number;

  @Prop()
  imageUrl?: string;

  @Prop()
  imageFilename?: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: [String], default: [] })
  additionalImages?: string[];

  @Prop({ type: [String], default: [] })
  additionalImageFilenames?: string[];

  @Prop({ type: [String], default: [], index: 'text' })
  tags?: string[];

  @Prop()
  weight?: number;

  @Prop({ type: Object })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'cm' | 'inch';
  };

  @Prop()
  supplier?: string;

  @Prop({ index: true })
  barcode?: string;

  @Prop()
  createdBy?: string;

  @Prop()
  lastModifiedBy?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1, lowStockThreshold: 1 });

ProductSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

ProductSchema.virtual('isLowStock').get(function () {
  const available = this.stock - this.reservedStock;
  return available <= this.lowStockThreshold && available > 0;
});

ProductSchema.virtual('effectivePrice').get(function () {
  if (this.salePrice && this.salePrice > 0) {
    return this.salePrice;
  }
  if (this.discountPercentage && this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

ProductSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

ProductSchema.set('toJSON', { virtuals: true });
