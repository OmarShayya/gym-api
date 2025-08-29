import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DayPassDocument = DayPass &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({ timestamps: true })
export class DayPass {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, unique: true })
  passId: string;

  @Prop({ required: true })
  qrCode: string;

  @Prop({ type: Date, required: true })
  validDate: Date;

  @Prop({ required: true, default: 'cash' })
  paymentMethod: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['active', 'used', 'expired'], default: 'active' })
  status: string;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop()
  notes?: string;
}

export const DayPassSchema = SchemaFactory.createForClass(DayPass);
