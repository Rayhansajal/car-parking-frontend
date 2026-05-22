import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParkingLotService } from '../../../core/services/parking-lot.service';

@Component({
  selector: 'app-parking-lot-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-lot-form.html',      // ← Fixed
  styleUrls: ['./parking-lot-form.scss']       // ← Fixed
})
export class ParkingLotFormComponent implements OnInit {

  formData: any = {
    name: '',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
    totalFloors: 1,
    hourlyRate: null,
    dailyRate: null,
    enabled: true
  };

  loading = false;
  success = '';
  error = '';

  constructor(
    private parkingLotService: ParkingLotService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    if (!this.formData.name || !this.formData.address || !this.formData.city || !this.formData.hourlyRate) {
      this.error = 'Please fill all required fields (*)';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.parkingLotService.create(this.formData).subscribe({
      next: (response) => {
        this.success = 'Parking lot created successfully!';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/parking-lots']);
        }, 1800);
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Failed to create parking lot';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/parking-lots']);
  }
}