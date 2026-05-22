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
  

loadUserInfo(): void {
    this.userName = localStorage.getItem('userName') || 'User';

    let savedRole = localStorage.getItem('userRole') || 
                    localStorage.getItem('role') ||
                    localStorage.getItem('currentRole');

    // If role is inside a user object
    if (!savedRole) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        savedRole = user.role || user.roles || 'Driver';
      }
    }

    this.userRole = savedRole || 'Driver';

    console.log('Loaded Role:', this.userRole);
  }

  // Improved role checking
  isAdmin(): boolean {
    if (!this.userRole) {
      console.log('❌ userRole is empty or null');
      return false;
    }

    const role = this.userRole.toString().toUpperCase().trim();
    console.log('🔍 Raw userRole:', this.userRole);
    console.log('🔍 Processed role:', role);

    const isAdminUser = role === 'ADMIN' || 
                        role === 'ROLE_ADMIN' || 
                        role.includes('ADMIN');

    console.log('✅ Final isAdmin result:', isAdminUser);
    
    return isAdminUser;
  }
  createNewLot(): void {
    this.router.navigate(['/parking-lots/new']);
  }

  loadParkingLots(): void {
    this.loading = true;
    this.error = '';

    this.parkingLotService.getAll(0, 12).subscribe({
      next: (response) => {
        console.log('📦 API Response received:', response);
        this.lots = response?.data?.content || response?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Load error:', err);
        this.error = 'Failed to load parking lots.';
        this.loading = false;
      }
    });
  }

  editLot(id: number): void {
    this.router.navigate(['/parking-lots', id, 'edit']);
  }

  deleteLot(id: number): void {
    if (confirm('Are you sure you want to delete this parking lot?')) {
      this.parkingLotService.delete(id).subscribe({
        next: () => {
          alert('Parking lot deleted successfully!');
          this.loadParkingLots();
        },
        error: (err) => {
          alert('Failed to delete parking lot.');
        }
      });
    }
  }

  onSearch(): void {
    console.log('Search:', this.searchTerm);
  }
}