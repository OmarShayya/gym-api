import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  MemberStatus,
  MembershipType,
} from '../../domain/enums/member-status.enum';
import { UserRole } from '../../../auth/domain/enums/user-role.enum';

export type MemberDocument = Member &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'members',
})
export class Member {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, unique: true, index: true })
  memberId: string;

  @Prop({ required: true })
  qrCode: string;

  @Prop({ sparse: true })
  fingerprintId?: string;

  @Prop({ type: Date, required: true })
  membershipStartDate: Date;

  @Prop({ type: Date, required: true, index: true })
  membershipEndDate: Date;

  @Prop({
    type: String,
    enum: Object.values(MembershipType),
    default: MembershipType.BASIC,
  })
  membershipType: string;

  @Prop({
    type: String,
    enum: Object.values(MemberStatus),
    default: MemberStatus.ACTIVE,
    index: true,
  })
  status: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.MEMBER,
  })
  role: string;

  @Prop({ type: Date })
  lastCheckIn?: Date;

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: Number, default: 0 })
  totalCheckIns: number;

  @Prop()
  profilePicture?: string;

  @Prop({
    type: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, required: true },
    },
    _id: false,
  })
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    _id: false,
  })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.index({ email: 1 });
MemberSchema.index({ memberId: 1 });
MemberSchema.index({ status: 1, membershipEndDate: 1 });
MemberSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
