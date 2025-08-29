export class CheckInResponseDto {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number;
  checkInMethod: string;
  status: 'active' | 'completed';
  type: 'member' | 'day-pass';
  dayPassInfo?: {
    passId: string;
    validDate: Date;
    amount: number;
  };
}
