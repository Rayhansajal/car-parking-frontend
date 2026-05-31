import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DashboardResponseDTO } from '../../models/dashboard.model';
import { DashboardService } from './dashboard.service';

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
  userName = 'User';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

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

  getOccupancyColor(rate: number): string {
    if (rate >= 80) return 'high';
    if (rate >= 60) return 'medium';
    return 'low';
  }

  getProgressWidth(rate: number): number {
    return Math.min(Math.max(Number(rate) || 0, 0), 100);
  }

  private loadUserInfo(): void {
    const token = this.authService.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName = payload.name || payload.fullName || payload.sub || 'User';
    } catch {
      this.userName = 'User';
    }
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

  private getNumber(source: unknown, key: keyof DashboardResponseDTO): number {
    if (!this.isRecord(source)) return 0;

    const value = source[key];
    return typeof value === 'number' ? value : Number(value) || 0;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
