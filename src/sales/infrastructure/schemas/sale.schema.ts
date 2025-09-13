// src/modules/sales/infrastructure/schemas/sale.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  PaymentMethod,
  SaleStatus,
  DiscountType,
} from '../../domain/enums/sale.enum';

export type SaleDocument = Sale &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({ _id: false })
export class Discount {
  @Prop({ required: true, enum: Object.values(DiscountType) })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description?: string;
}

@Schema({ _id: false })
export class RefundInfo {
  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Array, required: true })
  items: any[];

  @Prop({ type: Date, required: true })
  processedAt: Date;

  @Prop({ required: true })
  processedBy: string;

  @Prop()
  notes?: string;
}

@Schema({ _id: false })
export class SaleItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop()
  productSku?: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  refundedQuantity?: number;
}

@Schema({
  timestamps: true,
  collection: 'sales',
})
export class Sale {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  saleNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Member', required: true, index: true })
  memberId: Types.ObjectId;

  @Prop({ type: [SaleItem], required: true })
  items: SaleItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ type: Discount })
  discount?: Discount;

  @Prop({ required: true, default: 0 })
  tax: number;

  @Prop({ required: true })
  total: number;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: Object.values(SaleStatus),
    default: SaleStatus.COMPLETED,
    index: true,
  })
  status: string;

  @Prop()
  notes?: string;

  @Prop({ type: RefundInfo })
  refundInfo?: RefundInfo;

  @Prop()
  processedBy?: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);
export const DiscountSchema = SchemaFactory.createForClass(Discount);
export const RefundInfoSchema = SchemaFactory.createForClass(RefundInfo);
