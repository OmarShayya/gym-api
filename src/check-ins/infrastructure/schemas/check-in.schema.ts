import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CheckInMethod, CheckInStatus, CheckInType } from '../../domain/enums/check-in.enum';

export type CheckInDocument = CheckIn & Document<Types.ObjectId> & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({ _id: false })
export class DayPassInfo {
  @Prop({ required: true })
  passId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: Date, required: true })
  validDate: Date;

  @Prop({ required: true })
  amount: number;
}

export const DayPassInfoSchema = SchemaFactory.createForClass(DayPassInfo);

@Schema({ 
  timestamps: true,
  collection: 'checkins',
})
export class CheckIn {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Member', sparse: true })
  memberId?: Types.ObjectId;

  @Prop({ sparse: true })
  dayPassId?: string;

  @Prop({ type: DayPassInfoSchema })
  dayPassInfo?: DayPassInfo;

  @Prop({ type: Date, required: true, index: true })
  checkInTime: Date;

  @Prop({ type: Date })
  checkOutTime?: Date;

  @Prop({ type: Number })
  duration?: number;

  @Prop({ 
    type: String,
    enum: Object.values(CheckInMethod), 
    required: true 
  })
  method: string;

  @Prop({ 
    type: String,
    enum: Object.values(CheckInStatus), 
    default: CheckInStatus.ACTIVE,
    index: true,
  })
  status: string;

  @Prop({ 
    type: String,
    enum: Object.values(CheckInType), 
    required: true 
  })
  type: string;

  @Prop({ type: Boolean, default: true })
  autoCheckout: boolean;

  @Prop({ type: Date })
  scheduledCheckoutTime?: Date;

  @Prop()
  location?: string;

  @Prop()
  notes?: string;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);

CheckInSchema.index({ memberId: 1, status: 1 });
CheckInSchema.index({ dayPassId: 1, status: 1 });
CheckInSchema.index({ checkInTime: -1 });
CheckInSchema.index({ scheduledCheckoutTime: 1, status: 1 });
CheckInSchema.index({ status: 1, checkInTime: -1 });