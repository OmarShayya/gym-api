import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemberDocument = Member &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({ timestamps: true })
export class Member {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  memberId: string;

  @Prop({ required: true })
  qrCode: string;

  @Prop()
  fingerprintId?: string;

  @Prop({ type: Date, required: true })
  membershipStartDate: Date;

  @Prop({ type: Date, required: true })
  membershipEndDate: Date;

  @Prop({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: string;

  @Prop({ enum: ['member', 'admin'], default: 'member' })
  role: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
