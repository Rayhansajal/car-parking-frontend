export interface DashboardResponseDTO {
  totalParkingLots: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  totalBookingsToday: number;
  activeBookings: number;
  totalRevenueToday: number;
  totalRevenueThisMonth: number;
  occupancyRate: number;
}

export interface UserDashboardData {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  registeredVehicles: number;
  availableLots: number;
  availableSlots: number;
  recentBookings: Array<{
    id: number;
    code: string;
    vehicle: string;
    lot: string;
    slot: string;
    status: string;
    startTime: string;
  }>;
}
