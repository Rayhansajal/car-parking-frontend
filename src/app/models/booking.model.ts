export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

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
  status: BookingStatus | string;
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
  vehicleNumber: string;
  startTime: string;
  endTime: string;
}
