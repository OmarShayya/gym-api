/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({ timestamps: true })
export class Product {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ default: true })
  isActive: boolean;

  // Updated image handling with local storage
  @Prop()
  imageUrl?: string; // Main product image URL

  @Prop()
  imageFilename?: string; // Original filename for deletion

  @Prop()
  thumbnailUrl?: string; // Thumbnail URL

  @Prop({ type: [String], default: [] })
  additionalImages?: string[]; // Additional product image URLs

  @Prop({ type: [String], default: [] })
  additionalImageFilenames?: string[]; // Filenames for additional images

  // SEO and metadata
  @Prop()
  slug?: string; // URL-friendly version of name

  @Prop({ type: [String], default: [] })
  tags?: string[]; // Product tags for better categorization

  @Prop()
  weight?: number; // Product weight in grams

  @Prop({ type: Object })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };

  // Inventory tracking
  @Prop({ default: 0 })
  lowStockThreshold?: number; // Alert when stock goes below this

  @Prop()
  supplier?: string; // Supplier information

  // Pricing
  @Prop()
  costPrice?: number; // Cost price for profit calculation

  @Prop()
  salePrice?: number; // Sale price if different from regular price

  @Prop()
  discountPercentage?: number; // Discount percentage
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Add text index for search functionality
ProductSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
});

// Add compound index for common queries
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ sku: 1 }, { unique: true });

// Virtual for calculating final price with discount
ProductSchema.virtual('finalPrice').get(function () {
  if (this.salePrice && this.salePrice > 0) {
    return this.salePrice;
  }

  if (this.discountPercentage && this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }

  return this.price;
});

// Virtual for checking if product is low on stock
ProductSchema.virtual('isLowStock').get(function () {
  return this.stock <= (this.lowStockThreshold || 0);
});

// Auto-generate slug from name
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Ensure virtuals are included when converting to JSON
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
