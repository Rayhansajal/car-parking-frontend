import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ParkingLotService } from '../../core/services/parking-lot.service';
import { ParkingSlotService } from '../../core/services/parking-slot.service';
import { Booking, BookingRequestDTO } from '../../models/booking.model';
import { ParkingLot } from '../../models/parking-lot.model';
import { ParkingSlot } from '../../models/parking-slot.model';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  lots: ParkingLot[] = [];
  slots: ParkingSlot[] = [];

  loading = false;
  slotsLoading = false;
  error = '';
  searchTerm = '';
  selectedLotId: number | null = null;

  showModal = false;
  form: BookingRequestDTO = this.createEmptyForm();
  private requestedLotId: number | null = null;
  private requestedSlotId: number | null = null;

  constructor(
    private bookingService: BookingService,
    private parkingLotService: ParkingLotService,
    private parkingSlotService: ParkingSlotService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.readRequestedSlot();
    this.loadBookings();
    this.loadParkingLots();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  isStaff(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('OPERATOR');
  }

  openCreateModal(): void {
    this.form = this.createEmptyForm();
    this.selectedLotId = null;
    this.slots = [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form = this.createEmptyForm();
    this.selectedLotId = null;
    this.slots = [];
  }

  loadBookings(): void {
    this.loading = true;
    this.error = '';

    const request = this.isStaff()
      ? this.bookingService.getAll(0, 50)
      : this.bookingService.getMyBookings(0, 50);

    request.subscribe({
      next: (response: unknown) => {
        this.bookings = this.extractList<Booking>(response);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = this.getErrorMessage(err, 'Failed to load bookings.');
        this.loading = false;
      }
    });
  }

  loadSlotsForLot(preselectedSlotId?: number | null): void {
    this.form.slotId = preselectedSlotId ?? null;
    this.slots = [];

    if (!this.selectedLotId) return;

    this.slotsLoading = true;
    this.parkingSlotService.getByLot(this.selectedLotId).subscribe({
      next: (response: unknown) => {
        const requestedSlotId = preselectedSlotId ?? null;
        this.slots = this.extractList<ParkingSlot>(response)
          .filter(slot => this.getSlotStatus(slot) === 'AVAILABLE' || slot.id === requestedSlotId);
        if (requestedSlotId && this.slots.some(slot => slot.id === requestedSlotId)) {
          this.form.slotId = requestedSlotId;
        }
        this.slotsLoading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to load available slots.'));
        this.slotsLoading = false;
      }
    });
  }

  saveBooking(): void {
    if (!this.form.slotId) {
      alert('Please select a parking slot.');
      return;
    }

    if (!this.form.vehicleNumber.trim()) {
      alert('Please enter a vehicle number.');
      return;
    }

    if (!this.form.startTime || !this.form.endTime) {
      alert('Please select start and end time.');
      return;
    }

    if (new Date(this.form.endTime) <= new Date(this.form.startTime)) {
      alert('End time must be after start time.');
      return;
    }

    this.bookingService.create(this.buildRequestPayload()).subscribe({
      next: () => {
        alert('Booking created successfully.');
        this.closeModal();
        this.loadBookings();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to create booking.'));
      }
    });
  }

  cancelBooking(id: number): void {
    if (!confirm('Cancel this booking?')) return;

    this.bookingService.cancel(id).subscribe({
      next: () => {
        alert('Booking cancelled successfully.');
        this.loadBookings();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to cancel booking.'));
      }
    });
  }

  checkInBooking(id: number): void {
    this.bookingService.checkIn(id).subscribe({
      next: () => {
        alert('Check-in recorded.');
        this.loadBookings();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to check in booking.'));
      }
    });
  }

  checkOutBooking(id: number): void {
    this.bookingService.checkOut(id).subscribe({
      next: () => {
        alert('Check-out recorded.');
        this.loadBookings();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to check out booking.'));
      }
    });
  }

  canCancel(booking: Booking): boolean {
    const status = this.getBookingStatus(booking);
    return status === 'PENDING' || status === 'CONFIRMED' || status === 'ACTIVE';
  }

  canCheckIn(booking: Booking): boolean {
    return this.isStaff() && this.getBookingStatus(booking) === 'CONFIRMED';
  }

  canCheckOut(booking: Booking): boolean {
    return this.isStaff() && this.getBookingStatus(booking) === 'ACTIVE';
  }

  get filteredBookings(): Booking[] {
    const search = this.searchTerm.trim().toLowerCase();
    if (!search) return this.bookings;

    return this.bookings.filter(booking =>
      this.getBookingCode(booking).toLowerCase().includes(search) ||
      this.getVehicleNumber(booking).toLowerCase().includes(search) ||
      this.getBookingLot(booking).toLowerCase().includes(search) ||
      this.getBookingSlot(booking).toLowerCase().includes(search) ||
      this.getBookingStatus(booking).toLowerCase().includes(search)
    );
  }

  getBookingCode(booking: Booking): string {
    return booking.bookingCode || booking.bookingRef || booking.referenceNo || `BK-${booking.id}`;
  }

  getVehicleNumber(booking: Booking): string {
    return booking.vehicleNumber || booking.licensePlate || '-';
  }

  getBookingLot(booking: Booking): string {
    return booking.lotName || 'Unknown lot';
  }

  getBookingSlot(booking: Booking): string {
    return booking.slotNo || (booking.slotId ? `Slot ${booking.slotId}` : '-');
  }

  getBookingStatus(booking: Booking): string {
    return (booking.status || 'UNKNOWN').toString().toUpperCase();
  }

  getStatusClass(booking: Booking): string {
    return this.getBookingStatus(booking).toLowerCase();
  }

  getSlotLabel(slot: ParkingSlot): string {
    return `${slot.slotNo || slot.slotNumber || slot.id} - ${slot.slotType}`;
  }

  private loadParkingLots(): void {
    this.parkingLotService.getActiveLots().subscribe({
      next: (response: unknown) => {
        this.lots = this.extractList<ParkingLot>(response);
        this.openRequestedSlotBooking();
      },
      error: (err: unknown) => {
        console.error(err);
      }
    });
  }

  private buildRequestPayload(): BookingRequestDTO {
    return {
      slotId: this.form.slotId,
      vehicleNumber: this.form.vehicleNumber.trim(),
      startTime: this.form.startTime,
      endTime: this.form.endTime
    };
  }

  private readRequestedSlot(): void {
    const lotId = Number(this.route.snapshot.queryParamMap.get('lotId'));
    const slotId = Number(this.route.snapshot.queryParamMap.get('slotId'));

    this.requestedLotId = Number.isFinite(lotId) && lotId > 0 ? lotId : null;
    this.requestedSlotId = Number.isFinite(slotId) && slotId > 0 ? slotId : null;
  }

  private openRequestedSlotBooking(): void {
    if (!this.requestedLotId || !this.requestedSlotId) return;

    this.form = this.createEmptyForm();
    this.selectedLotId = this.requestedLotId;
    this.showModal = true;
    this.loadSlotsForLot(this.requestedSlotId);
    this.requestedLotId = null;
    this.requestedSlotId = null;
  }

  private createEmptyForm(): BookingRequestDTO {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);

    const end = new Date(start);
    end.setHours(end.getHours() + 2);

    return {
      slotId: null,
      vehicleNumber: '',
      startTime: this.toDateTimeInputValue(start),
      endTime: this.toDateTimeInputValue(end)
    };
  }

  private toDateTimeInputValue(date: Date): string {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  }

  private getSlotStatus(slot: ParkingSlot): string {
    return (slot.status || '').toString();
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
    }

    return [];
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error;

      if (this.isRecord(backendError)) {
        const message = backendError['message'];
        const validationDetails = this.getValidationDetails(backendError);
        if (typeof message === 'string' && message.trim()) {
          return validationDetails
            ? `${fallback}: ${message}. ${validationDetails}`
            : `${fallback}: ${message}`;
        }

        const errorMessage = backendError['error'];
        if (typeof errorMessage === 'string' && errorMessage.trim()) {
          return validationDetails
            ? `${fallback}: ${errorMessage}. ${validationDetails}`
            : `${fallback}: ${errorMessage}`;
        }

        if (validationDetails) return `${fallback}: ${validationDetails}`;
      }

      if (typeof backendError === 'string' && backendError.trim()) {
        return `${fallback}: ${backendError}`;
      }

      if (error.status) return `${fallback} Server returned ${error.status}.`;
    }

    return fallback;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getValidationDetails(errorBody: Record<string, unknown>): string {
    const errors = errorBody['errors'];

    if (Array.isArray(errors)) {
      return errors
        .map(error => this.formatValidationError(error))
        .filter(Boolean)
        .join(', ');
    }

    if (this.isRecord(errors)) {
      return Object.entries(errors)
        .map(([field, message]) => `${field}: ${this.formatValidationError(message)}`)
        .filter(detail => !detail.endsWith(': '))
        .join(', ');
    }

    const fieldErrors = errorBody['fieldErrors'];
    if (this.isRecord(fieldErrors)) {
      return Object.entries(fieldErrors)
        .map(([field, message]) => `${field}: ${this.formatValidationError(message)}`)
        .filter(detail => !detail.endsWith(': '))
        .join(', ');
    }

    return '';
  }

  private formatValidationError(error: unknown): string {
    if (typeof error === 'string') return error;

    if (this.isRecord(error)) {
      const field = error['field'];
      const message = error['message'] || error['defaultMessage'];

      if (typeof field === 'string' && typeof message === 'string') {
        return `${field}: ${message}`;
      }

      if (typeof message === 'string') return message;
    }

    return '';
  }
}
