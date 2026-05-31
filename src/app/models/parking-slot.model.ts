export type ParkingSlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type VehicleType = string;

export interface ParkingSlot {
  id: number;
  lotId: number;
  lotName?: string;
  slotNo: string;
  floor: number;
  zone?: string;
  slotType: VehicleType;
  status: ParkingSlotStatus;
  updatedAt?: string;
  slotNumber?: string;
  floorNumber?: number;
  parkingLotId?: number;
  parkingLotName?: string;
  createdAt?: string;
}

export interface ParkingSlotRequestDTO {
  lotId: number | null;
  slotNo: string;
  floor: number;
  zone?: string;
  slotType: VehicleType;
  status: ParkingSlotStatus;
}
