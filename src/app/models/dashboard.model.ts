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