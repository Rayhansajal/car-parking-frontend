import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDTO } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardResponseDTO | null = null;
  loading = true;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        this.dashboardData = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  getOccupancyColor(rate: number): string {
    if (rate >= 80) return 'high';
    if (rate >= 60) return 'medium';
    return 'low';
  }

}
