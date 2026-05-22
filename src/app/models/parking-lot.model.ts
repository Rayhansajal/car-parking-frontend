export interface ParkingLot {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  totalFloors: number;
  hourlyRate: number;
  dailyRate?: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParkingLotRequest {
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  totalFloors: number;
  hourlyRate: number;
  dailyRate?: number;
}