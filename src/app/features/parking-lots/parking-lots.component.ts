import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ParkingLotService } from '../../core/services/parking-lot.service';
import { AuthService } from '../../core/services/auth.service';
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

  // Modal control
  showModal = false;
  isEditing = false;
  selectedLotId: number | null = null;

 
  form: ParkingLotRequestDTO = {
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

    const lot = this.lots.find(l => l.id === id);
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

  private createParkingLot(): void {
    this.parkingLotService.create(this.form).subscribe({
      next: () => {
        alert('✅ Parking lot created successfully!');
        this.closeModal();
        this.loadParkingLots();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to create parking lot.');
      }
    });
  }

  private updateParkingLot(): void {
    if (this.selectedLotId === null) return;

    this.parkingLotService.update(this.selectedLotId, this.form).subscribe({
      next: () => {
        alert('✅ Parking lot updated successfully!');
        this.closeModal();
        this.loadParkingLots();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to update parking lot.');
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.form = {
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

  deleteLot(id: number): void {
    if (!this.isAdmin()) return;
    if (!confirm('Are you sure you want to delete this parking lot?')) return;

    this.parkingLotService.delete(id).subscribe({
      next: () => {
        alert('✅ Parking lot deleted successfully!');
        this.loadParkingLots();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to delete. It may have active bookings.');
      }
    });
  }

  loadParkingLots(): void {
    this.loading = true;
    this.error = '';

    this.parkingLotService.getAll(0, 12).subscribe({
      next: (response: any) => {
        this.lots = response?.data?.content || response?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load parking lots. Please try again.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    console.log('Searching for:', this.searchTerm);
    
  }
}