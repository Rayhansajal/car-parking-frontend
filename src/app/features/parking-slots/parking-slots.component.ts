import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ParkingLotService } from '../../core/services/parking-lot.service';
import { ParkingSlotService } from '../../core/services/parking-slot.service';
import { ParkingLot } from '../../models/parking-lot.model';
import { ParkingSlot, ParkingSlotRequestDTO, ParkingSlotStatus, VehicleType } from '../../models/parking-slot.model';

@Component({
  selector: 'app-parking-slots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-slots.component.html',
  styleUrl: './parking-slots.component.scss'
})
export class ParkingSlotsComponent implements OnInit {
  slots: ParkingSlot[] = [];
  lots: ParkingLot[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedLotFilter = '';

  showModal = false;
  isEditing = false;
  selectedSlotId: number | null = null;

  statuses: ParkingSlotStatus[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
  slotTypes: VehicleType[] = ['TWO_WHEELER', 'FOUR_WHEELER', 'EV', 'HANDICAPPED', 'HEAVY'];

  form: ParkingSlotRequestDTO = this.createEmptyForm();

  constructor(
    private parkingSlotService: ParkingSlotService,
    private parkingLotService: ParkingLotService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.readLotFilter();
    this.loadParkingLots();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  createNewSlot(): void {
    if (!this.isAdmin()) return;

    this.form = this.createEmptyForm();
    this.isEditing = false;
    this.selectedSlotId = null;
    this.showModal = true;
  }

  editSlot(slot: ParkingSlot): void {
    if (!this.isAdmin()) return;

    this.selectedSlotId = slot.id;
    this.isEditing = true;
    this.form = {
      lotId: this.getSlotLotId(slot),
      slotNo: this.getSlotNumber(slot),
      floor: this.getSlotFloor(slot),
      zone: slot.zone || '',
      slotType: slot.slotType,
      status: slot.status
    };
    this.showModal = true;
  }

  saveParkingSlot(): void {
    if (!this.form.lotId) {
      alert('Please select a parking lot.');
      return;
    }

    if (!this.form.slotNo.trim()) {
      alert('Please enter a slot number.');
      return;
    }

    if (this.isEditing && this.selectedSlotId !== null) {
      this.updateParkingSlot();
    } else {
      this.createParkingSlot();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSlotId = null;
    this.form = this.createEmptyForm();
  }

  deleteSlot(id: number): void {
    if (!this.isAdmin()) return;
    if (!confirm('Are you sure you want to delete this parking slot?')) return;

    this.parkingSlotService.delete(id).subscribe({
      next: () => {
        alert('Parking slot deleted successfully.');
        this.loadParkingSlots();
      },
      error: (err: unknown) => {
        console.error(err);
        alert('Failed to delete parking slot.');
      }
    });
  }

  bookSlot(slot: ParkingSlot): void {
    if (!this.canBookSlot(slot)) return;

    this.router.navigate(['/bookings/my'], {
      queryParams: {
        lotId: this.getSlotLotId(slot),
        slotId: slot.id
      }
    });
  }

  loadParkingSlots(): void {
    this.loading = true;
    this.error = '';

    const selectedLotId = Number(this.selectedLotFilter);
    const lotsToLoad = selectedLotId
      ? this.lots.filter(lot => lot.id === selectedLotId)
      : this.lots;

    const slotRequests = lotsToLoad.map(lot =>
      this.parkingSlotService.getByLot(lot.id).pipe(
        map(response => this.extractList<ParkingSlot>(response)),
        catchError(err => {
          console.error(`Failed to load parking slots for lot ${lot.id}`, err);
          return of([] as ParkingSlot[]);
        })
      )
    );

    if (slotRequests.length === 0) {
      this.slots = [];
      this.loading = false;
      return;
    }

    forkJoin(slotRequests).subscribe({
      next: (slotGroups: ParkingSlot[][]) => {
        this.slots = slotGroups.flat();
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = this.getErrorMessage(err, 'Failed to load parking slots.');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadParkingSlots();
  }

  clearLotFilter(): void {
    this.selectedLotFilter = '';
    this.router.navigate(['/slots']);
    this.loadParkingSlots();
  }

  get filteredSlots(): ParkingSlot[] {
    const search = this.searchTerm.trim().toLowerCase();
    const searchedSlots = search
      ? this.slots.filter(slot =>
          this.getSlotNumber(slot).toLowerCase().includes(search) ||
          this.getLotName(slot).toLowerCase().includes(search) ||
          this.getSlotStatus(slot).toString().toLowerCase().includes(search) ||
          slot.slotType.toLowerCase().includes(search) ||
          (slot.zone || '').toLowerCase().includes(search)
        )
      : this.slots;

    if (!this.selectedLotFilter) return searchedSlots;

    const lotId = Number(this.selectedLotFilter);
    return searchedSlots.filter(slot => this.getSlotLotId(slot) === lotId);
  }

  getLotName(slot: ParkingSlot): string {
    if (slot.parkingLotName || slot.lotName) return slot.parkingLotName || slot.lotName || '';

    const lotId = this.getSlotLotId(slot);
    return this.lots.find(lot => lot.id === lotId)?.name || 'Unknown lot';
  }

  getSlotNumber(slot: ParkingSlot): string {
    return slot.slotNo || slot.slotNumber || '';
  }

  getSlotFloor(slot: ParkingSlot): number {
    return slot.floor ?? slot.floorNumber ?? 1;
  }

  getSlotLotId(slot: ParkingSlot): number | null {
    return slot.lotId ?? slot.parkingLotId ?? null;
  }

  getSlotStatus(slot: ParkingSlot): ParkingSlotStatus | string {
    return slot.status || 'UNKNOWN';
  }

  getSlotStatusClass(slot: ParkingSlot): string {
    return this.getSlotStatus(slot).toString().toLowerCase();
  }

  canBookSlot(slot: ParkingSlot): boolean {
    return this.getSlotStatus(slot).toString().toUpperCase() === 'AVAILABLE';
  }

  private loadParkingLots(): void {
    this.parkingLotService.getActiveLots().subscribe({
      next: (response: unknown) => {
        this.lots = this.extractList<ParkingLot>(response);
        this.loadParkingSlots();
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = this.getErrorMessage(err, 'Failed to load parking lots.');
      }
    });
  }

  private readLotFilter(): void {
    const lotId = Number(this.route.snapshot.queryParamMap.get('lotId'));
    this.selectedLotFilter = Number.isFinite(lotId) && lotId > 0 ? lotId.toString() : '';
  }

  private createParkingSlot(): void {
    this.parkingSlotService.create(this.buildRequestPayload()).subscribe({
      next: () => {
        alert('Parking slot created successfully.');
        this.closeModal();
        this.loadParkingSlots();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to create parking slot.'));
      }
    });
  }

  private updateParkingSlot(): void {
    if (this.selectedSlotId === null) return;

    this.parkingSlotService.update(this.selectedSlotId, this.buildRequestPayload()).subscribe({
      next: () => {
        alert('Parking slot updated successfully.');
        this.closeModal();
        this.loadParkingSlots();
      },
      error: (err: unknown) => {
        console.error(err);
        alert(this.getErrorMessage(err, 'Failed to update parking slot.'));
      }
    });
  }

  private buildRequestPayload(): ParkingSlotRequestDTO {
    const zone = this.form.zone?.trim();

    return {
      lotId: this.form.lotId,
      slotNo: this.form.slotNo.trim(),
      floor: Number(this.form.floor) || 1,
      ...(zone ? { zone } : {}),
      slotType: this.form.slotType,
      status: this.form.status
    };
  }

  private createEmptyForm(): ParkingSlotRequestDTO {
    return {
      lotId: null,
      slotNo: '',
      floor: 1,
      zone: '',
      slotType: 'FOUR_WHEELER',
      status: 'AVAILABLE'
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

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error;

      if (this.isRecord(backendError)) {
        const message = backendError['message'];
        if (typeof message === 'string' && message.trim()) {
          return `${fallback}: ${message}`;
        }

        const errorMessage = backendError['error'];
        if (typeof errorMessage === 'string' && errorMessage.trim()) {
          return `${fallback}: ${errorMessage}`;
        }

        const detail = backendError['detail'];
        if (typeof detail === 'string' && detail.trim()) {
          return `${fallback}: ${detail}`;
        }

        const errors = backendError['errors'];
        if (this.isRecord(errors)) {
          const firstError = Object.values(errors).find(value => typeof value === 'string' && value.trim());
          if (typeof firstError === 'string') {
            return `${fallback}: ${firstError}`;
          }
        }
      }

      if (typeof backendError === 'string' && backendError.trim()) {
        return `${fallback}: ${backendError}`;
      }

      if (error.status) {
        return `${fallback}. Server returned ${error.status}.`;
      }
    }

    return fallback;
  }
}
