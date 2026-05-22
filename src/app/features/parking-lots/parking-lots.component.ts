import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ParkingLotService } from '../../core/services/parking-lot.service';
import { ParkingLot } from '../../models/parking-lot.model';

@Component({
  selector: 'app-parking-lots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-lots.component.html',
  styleUrls: ['./parking-lots.component.scss']
})
export class ParkingLotsComponent implements OnInit {

  lots: ParkingLot[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  constructor(private parkingLotService: ParkingLotService) {}

  ngOnInit(): void {
    this.loadParkingLots();
  }

  loadParkingLots(): void {
    this.loading = true;
    this.error = '';

    this.parkingLotService.getAll(0, 12).subscribe({
      next: (response) => {
        this.lots = response?.data?.content || response?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading parking lots:', err);
        this.error = 'Failed to load parking lots. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteLot(id: number): void {
    if (confirm('Are you sure you want to delete this parking lot?')) {
      this.parkingLotService.delete(id).subscribe({
        next: () => {
          alert('Parking lot deleted successfully!');
          this.loadParkingLots();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete parking lot. It may have slots or bookings.');
        }
      });
    }
  }

  // ← ADD THIS METHOD
  editLot(id: number): void {
    console.log('Edit lot with ID:', id);
    // Later you can navigate to edit page:
    // this.router.navigate(['/parking-lots', id, 'edit']);
  }

  createNewLot(): void {
    console.log('Create new parking lot clicked');
    // Later navigate to create form
  }

  onSearch(): void {
    console.log('Searching for:', this.searchTerm);
  }
}