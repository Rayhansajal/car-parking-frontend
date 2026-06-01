export type VehicleType =
  | 'TWO_WHEELER'
  | 'FOUR_WHEELER'
  | 'EV'
  | 'HANDICAPPED'
  | 'HEAVY';

export interface VehicleRequestDTO {
  plateNo: string;
  type: VehicleType;
  brand?: string;
  model?: string;
  color?: string;
}

export interface VehicleResponseDTO {
  id: number;
  userId: number;
  ownerName: string;
  plateNo: string;
  type: VehicleType;
  brand?: string;
  model?: string;
  color?: string;
  createdAt?: string;
}
