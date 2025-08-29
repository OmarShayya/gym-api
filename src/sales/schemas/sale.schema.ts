import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleDocument = Sale &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export interface SaleItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

@Schema({ timestamps: true })
export class Sale {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  memberId: Types.ObjectId;

  @Prop({ required: true })
  items: SaleItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: 'completed' })
  status: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  saleNumber: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
