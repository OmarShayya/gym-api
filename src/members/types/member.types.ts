import { Types } from 'mongoose';

export interface MemberObject {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  memberId: string;
  qrCode: string;
  fingerprintId?: string;
  membershipStartDate: Date;
  membershipEndDate: Date;
  status: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}
