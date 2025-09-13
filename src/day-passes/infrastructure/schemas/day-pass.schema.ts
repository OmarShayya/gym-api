import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  DayPassStatus,
  PaymentMethod,
  DayPassType,
} from '../../domain/enums/day-pass.enum';

export type DayPassDocument = DayPass &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'daypasses',
})
export class DayPass {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, unique: true, index: true })
  passId: string;

  @Prop({ required: true })
  qrCode: string;

  @Prop({ type: Date, required: true, index: true })
  validDate: Date;

  @Prop({
    type: String,
    enum: Object.values(DayPassType),
    default: DayPassType.SINGLE,
  })
  type: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.CASH,
  })
  paymentMethod: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: Object.values(DayPassStatus),
    default: DayPassStatus.ACTIVE,
    index: true,
  })
  status: string;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop({ type: Number, default: 1 })
  numberOfPeople: number;

  @Prop()
  notes?: string;

  @Prop()
  createdBy?: string;
}

export const DayPassSchema = SchemaFactory.createForClass(DayPass);

DayPassSchema.index({ status: 1, validDate: 1 });
DayPassSchema.index({ email: 1 });
DayPassSchema.index({ passId: 'text', firstName: 'text', lastName: 'text' });
