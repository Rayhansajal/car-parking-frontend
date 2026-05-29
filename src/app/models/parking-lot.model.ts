
export interface ParkingLot {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  totalFloors?: number;
  hourlyRate: number;
  dailyRate?: number;
  enabled: boolean;
  totalSlots: number;
  availableSlots: number;
  createdAt?: string;
}
export interface ParkingLotRequestDTO {
  name: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  totalFloors?: number;
  hourlyRate: number;
  dailyRate?: number;
  enabled?: boolean;
}

export interface ParkingLotResponseDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  totalFloors?: number;
  hourlyRate: number;
  dailyRate?: number;
  enabled: boolean;
  totalSlots: number;
  availableSlots: number;
  createdAt?: string;
}

export interface ApiResponseDTO<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}