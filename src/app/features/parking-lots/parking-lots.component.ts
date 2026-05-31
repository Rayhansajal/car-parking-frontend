import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { ParkingLotService } from '../../core/services/parking-lot.service';
import { ParkingLot, ParkingLotRequestDTO } from '../../models/parking-lot.model';

@Component({
  selector: 'app-parking-lots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-lots.component.html',
  styleUrls: ['./parking-lots.component.scss']
})
export class ParkingLotsComponent implements OnInit {
  lots: ParkingLot[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  showModal = false;
  isEditing = false;
  selectedLotId: number | null = null;

  form: ParkingLotRequestDTO = this.createEmptyForm();

  constructor(
    private parkingLotService: ParkingLotService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadParkingLots();
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  createNewLot(): void {
    if (!this.isAdmin()) return;

    this.resetForm();
    this.isEditing = false;
    this.selectedLotId = null;
    this.showModal = true;
  }

  editLot(id: number): void {
    if (!this.isAdmin()) return;

    const lot = this.lots.find(item => item.id === id);
    if (!lot) return;

    this.selectedLotId = id;
    this.isEditing = true;
    this.form = {
      name: lot.name,
      address: lot.address,
      city: lot.city || '',
      hourlyRate: lot.hourlyRate,
      enabled: lot.enabled,
      dailyRate: lot.dailyRate || 0,
      latitude: lot.latitude || 0,
      longitude: lot.longitude || 0,
      totalFloors: lot.totalFloors || 0
    };
    this.showModal = true;
  }

  saveParkingLot(): void {
    if (this.isEditing && this.selectedLotId !== null) {
      this.updateParkingLot();
    } else {
      this.createParkingLot();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  deleteLot(id: number): void {
    if (!this.isAdmin()) return;
    if (!confirm('Are you sure you want to delete this parking lot?')) return;

    this.parkingLotService.delete(id).subscribe({
      next: () => {
        alert('Parking lot deleted successfully.');
        this.loadParkingLots();
      },
      error: (err: unknown) => {
        console.error(err);
        alert('Failed to delete. It may have active bookings.');
      }
    });
  }

  loadParkingLots(): void {
    this.loading = true;
    this.error = '';

    this.parkingLotService.getAll(0, 12, this.searchTerm.trim()).subscribe({
      next: (response: unknown) => {
        this.lots = this.extractList<ParkingLot>(response);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = 'Failed to load parking lots. Please try again.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadParkingLots();
  }

  private createParkingLot(): void {
    this.parkingLotService.create(this.form).subscribe({
      next: () => {
        alert('Parking lot created successfully.');
        this.closeModal();
        this.loadParkingLots();
      },
      error: (err: unknown) => {
        console.error(err);
        alert('Failed to create parking lot.');
      }
    });
  }

  private updateParkingLot(): void {
    if (this.selectedLotId === null) return;

    this.parkingLotService.update(this.selectedLotId, this.form).subscribe({
      next: () => {
        alert('Parking lot updated successfully.');
        this.closeModal();
        this.loadParkingLots();
      },
      error: (err: unknown) => {
        console.error(err);
        alert('Failed to update parking lot.');
      }
    });
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
  }

  private createEmptyForm(): ParkingLotRequestDTO {
    return {
      name: '',
      address: '',
      city: '',
      hourlyRate: 0,
      enabled: true,
      dailyRate: 0,
      latitude: 0,
      longitude: 0,
      totalFloors: 0
    };
  }

  private extractList<T>(response: unknown): T[] {
    if (Array.isArray(response)) return response as T[];

    if (this.isRecord(response)) {
      const data = response['data'];
      if (Array.isArray(data)) return data as T[];

      if (this.isRecord(data)) {
        const content = data['content'];
        if (Array.isArray(content)) return content as T[];
      }
    }

    return [];
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
