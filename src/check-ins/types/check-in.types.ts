import { Types } from 'mongoose';
import { MemberDocument } from '../../members/schemas/member.schema';

export interface PopulatedCheckIn {
  _id: Types.ObjectId;
  memberId: MemberDocument;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number;
  checkInMethod: string;
  createdAt?: Date;
  updatedAt?: Date;
}
