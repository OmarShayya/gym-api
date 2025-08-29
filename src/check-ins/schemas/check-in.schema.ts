import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CheckInDocument = CheckIn &
  Document<Types.ObjectId> & {
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

@Schema({ timestamps: true })
export class CheckIn {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Member', required: false })
  memberId?: Types.ObjectId;

  @Prop({ type: DayPassInfoSchema, required: false })
  dayPassInfo?: DayPassInfo;

  @Prop({ required: true })
  checkInTime: Date;

  @Prop()
  checkOutTime?: Date;

  @Prop()
  duration?: number;

  @Prop({ enum: ['qr', 'fingerprint', 'manual'], required: true })
  checkInMethod: string;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);

CheckInSchema.index(
  { memberId: 1, dayPassInfo: 1 },
  {
    partialFilterExpression: {
      $or: [
        { memberId: { $exists: true } },
        { dayPassInfo: { $exists: true } },
      ],
    },
  },
);
