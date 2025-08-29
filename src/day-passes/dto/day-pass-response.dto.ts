export class DayPassResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passId: string;
  qrCode: string;
  validDate: Date;
  paymentMethod: string;
  amount: number;
  status: string;
  usedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
