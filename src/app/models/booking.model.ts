export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_SHOW';

export interface Booking {
  id: number;
  bookingCode?: string;
  bookingRef?: string;
  referenceNo?: string;
  lotId?: number;
  lotName?: string;
  slotId?: number;
  slotNo?: string;
  vehicleNumber?: string;
  licensePlate?: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalAmount?: number;
  totalFee?: number;
  createdAt?: string;
}

export interface BookingRequestDTO {
  slotId: number | null;
  vehicleId: number | null;
  startTime: string;
  endTime: string;
}
