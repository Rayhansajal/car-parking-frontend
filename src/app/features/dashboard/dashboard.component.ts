import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ParkingLotService } from '../../core/services/parking-lot.service';
import { ParkingSlotService } from '../../core/services/parking-slot.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { Booking } from '../../models/booking.model';
import { DashboardResponseDTO, UserDashboardData } from '../../models/dashboard.model';
import { ParkingLot } from '../../models/parking-lot.model';
import { ParkingSlot } from '../../models/parking-slot.model';
import { VehicleResponseDTO } from '../../models/vehicle.model';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardResponseDTO | null = null;
  userDashboardData: UserDashboardData | null = null;
  loading = true;
  error = '';
  userName = 'User';

  constructor(
    private dashboardService: DashboardService,
    private bookingService: BookingService,
    private parkingLotService: ParkingLotService,
    private parkingSlotService: ParkingSlotService,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';
    this.dashboardData = null;
    this.userDashboardData = null;

    if (!this.isStaff()) {
      this.loadUserDashboard();
      return;
    }

    this.dashboardService.getDashboard().subscribe({
      next: (response: unknown) => {
        this.dashboardData = this.normalizeDashboardData(response);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = 'Failed to load dashboard data.';
        this.loading = false;
      }
    });
  }

  isStaff(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('OPERATOR');
  }

  getOccupancyColor(rate: number): string {
    if (rate >= 80) return 'high';
    if (rate >= 60) return 'medium';
    return 'low';
  }

  getProgressWidth(rate: number): number {
    return Math.min(Math.max(Number(rate) || 0, 0), 100);
  }

  private loadUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser.name) {
      this.userName = currentUser.name;
      return;
    }

    const token = this.authService.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName = payload.name || payload.fullName || payload.sub || 'User';
    } catch {
      this.userName = 'User';
    }
  }

  private loadUserDashboard(): void {
    this.parkingLotService.getActiveLots().pipe(
      map(response => this.extractList<ParkingLot>(response)),
      catchError(err => {
        console.error(err);
        return of([] as ParkingLot[]);
      })
    ).subscribe(lots => {
      const slotRequests = lots.map(lot =>
        this.parkingSlotService.getByLot(lot.id).pipe(
          map(response => this.extractList<ParkingSlot>(response)),
          catchError(err => {
            console.error(`Failed to load slots for lot ${lot.id}`, err);
            return of([] as ParkingSlot[]);
          })
        )
      );

      forkJoin({
        bookings: this.bookingService.getMyBookings(0, 50).pipe(
          map(response => this.extractList<Booking>(response)),
          catchError(err => {
            console.error(err);
            return of([] as Booking[]);
          })
        ),
        vehicles: this.vehicleService.getMyVehicles().pipe(
          map(response => this.extractList<VehicleResponseDTO>(response)),
          catchError(err => {
            console.error(err);
            return of([] as VehicleResponseDTO[]);
          })
        ),
        slots: slotRequests.length ? forkJoin(slotRequests) : of([] as ParkingSlot[][])
      }).subscribe({
        next: ({ bookings, vehicles, slots }) => {
          this.userDashboardData = this.buildUserDashboardData(bookings, vehicles, lots, slots.flat());
          this.loading = false;
        },
        error: (err: unknown) => {
          console.error(err);
          this.error = 'Failed to load dashboard data.';
          this.loading = false;
        }
      });
    });
  }

  private buildUserDashboardData(
    bookings: Booking[],
    vehicles: VehicleResponseDTO[],
    lots: ParkingLot[],
    slots: ParkingSlot[]
  ): UserDashboardData {
    const activeStatuses = new Set(['PENDING', 'CONFIRMED', 'CHECKED_IN']);
    const completedStatuses = new Set(['CHECKED_OUT', 'COMPLETED']);

    return {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(booking => activeStatuses.has(this.getBookingStatus(booking))).length,
      completedBookings: bookings.filter(booking => completedStatuses.has(this.getBookingStatus(booking))).length,
      registeredVehicles: vehicles.length,
      availableLots: lots.length,
      availableSlots: slots.filter(slot => this.getSlotStatus(slot) === 'AVAILABLE').length,
      recentBookings: bookings
        .slice()
        .sort((left, right) => this.getTimeValue(this.getBookingStartTime(right)) - this.getTimeValue(this.getBookingStartTime(left)))
        .slice(0, 5)
        .map(booking => ({
          id: booking.id,
          code: booking.bookingCode || booking.bookingRef || booking.referenceNo || `BK-${booking.id}`,
          vehicle: booking.vehicleNumber || booking.vehiclePlate || booking.licensePlate || '-',
          lot: booking.lotName || 'Unknown lot',
          slot: booking.slotNo || (booking.slotId ? `Slot ${booking.slotId}` : '-'),
          status: this.getBookingStatus(booking),
          startTime: this.getBookingStartTime(booking)
        }))
    };
  }

  private normalizeDashboardData(response: unknown): DashboardResponseDTO {
    const data = this.isRecord(response) && this.isRecord(response['data'])
      ? response['data']
      : response;

    return {
      totalParkingLots: this.getNumber(data, 'totalParkingLots'),
      totalSlots: this.getNumber(data, 'totalSlots'),
      availableSlots: this.getNumber(data, 'availableSlots'),
      occupiedSlots: this.getNumber(data, 'occupiedSlots'),
      totalBookingsToday: this.getNumber(data, 'totalBookingsToday'),
      activeBookings: this.getNumber(data, 'activeBookings'),
      totalRevenueToday: this.getNumber(data, 'totalRevenueToday'),
      totalRevenueThisMonth: this.getNumber(data, 'totalRevenueThisMonth'),
      occupancyRate: this.getNumber(data, 'occupancyRate')
    };
  }

  private extractList<T>(response: unknown): T[] {
    if (Array.isArray(response)) return response as T[];

    if (this.isRecord(response)) {
      const content = response['content'];
      if (Array.isArray(content)) return content as T[];

      const data = response['data'];
      if (Array.isArray(data)) return data as T[];

      if (this.isRecord(data)) {
        const dataContent = data['content'];
        if (Array.isArray(dataContent)) return dataContent as T[];
      }

      const embedded = response['_embedded'];
      if (this.isRecord(embedded)) {
        const firstEmbeddedList = Object.values(embedded).find(Array.isArray);
        if (Array.isArray(firstEmbeddedList)) return firstEmbeddedList as T[];
      }
    }

    return [];
  }

  private getBookingStatus(booking: Booking): string {
    return (booking.status || 'UNKNOWN').toString().toUpperCase();
  }

  private getSlotStatus(slot: ParkingSlot): string {
    return (slot.status || '').toString().toUpperCase();
  }

  private getBookingStartTime(booking: Booking): string {
    return booking.startTime || booking.scheduledCheckIn || booking.createdAt || '';
  }

  private getTimeValue(value?: string): number {
    if (!value) return 0;
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  }

  private getNumber(source: unknown, key: keyof DashboardResponseDTO): number {
    if (!this.isRecord(source)) return 0;

    const value = source[key];
    return typeof value === 'number' ? value : Number(value) || 0;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
