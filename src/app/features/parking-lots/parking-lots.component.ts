import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  // User Info
  userName: string = 'User';
  userRole: string = 'Driver';

  constructor(
    private parkingLotService: ParkingLotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadParkingLots();
  }

  /** Load user info from localStorage */
  loadUserInfo(): void {
    this.userName = localStorage.getItem('userName') || 'User';
    this.userRole = localStorage.getItem('userRole') || 
                    localStorage.getItem('role') || 'Driver';

    console.log('👤 Current User Role:', this.userRole);
  }

  /** Check if user is Admin */
  isAdmin(): boolean {
    if (!this.userRole) return false;
    
    const role = this.userRole.toString().toUpperCase().trim();
    return role === 'ADMIN' || 
           role === 'ROLE_ADMIN' || 
           role.includes('ADMIN');
  }

  /** Create New Parking Lot - Admin Only */
  createNewLot(): void {
    if (!this.isAdmin()) {
      alert('Only Admin can create new parking lots.');
      return;
    }
    this.router.navigate(['/parking-lots/new']);
  }

  /** Load all parking lots */
  loadParkingLots(): void {
    this.loading = true;
    this.error = '';

    this.parkingLotService.getAll(0, 12).subscribe({
      next: (response) => {
        console.log('📦 Parking Lots Response:', response);
        this.lots = response?.data?.content || response?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading parking lots:', err);
        this.error = 'Failed to load parking lots. Please try again.';
        this.loading = false;
      }
    });
  }

    // Only Admin can Edit
  editLot(id: number): void {
    if (!this.isAdmin()) {
      alert('Only Admin can edit parking lots.');
      return;
    }
    this.router.navigate(['/parking-lots', id, 'edit']);
  }

  // Only Admin can Delete
  deleteLot(id: number): void {
    if (!this.isAdmin()) {
      alert('Only Admin can delete parking lots.');
      return;
    }

    if (confirm('Are you sure you want to delete this parking lot?')) {
      this.parkingLotService.delete(id).subscribe({
        next: () => {
          alert('Parking lot deleted successfully!');
          this.loadParkingLots();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete parking lot. It may have active slots or bookings.');
        }
      });
    }
  }

  onSearch(): void {
    console.log('🔍 Searching for:', this.searchTerm);
    // You can implement search logic later
  }
}