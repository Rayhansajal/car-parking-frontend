import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
 userName: string = 'Guest';
  userRole: string = 'USER';
  userEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  private loadUserInfo() {
  const token = this.authService.getToken();
  if (!token) return;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT structure');

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));

    this.userName = payload.name || payload.fullName || payload.sub || 'User';
    this.userEmail = payload.sub || payload.email || '';
    this.userRole = this.formatRole(this.extractRole(payload));

  } catch (error) {
    console.error('Failed to decode token:', error);
  }
}

private extractRole(payload: Record<string, unknown>): string {
  const raw = payload['roles'] ?? payload['role'] ?? payload['authorities'];
  if (Array.isArray(raw) && raw.length > 0) return String(raw[0]);
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return 'USER';
}

private formatRole(role: string): string {
  const stripped = role.startsWith('ROLE_') ? role.slice(5) : role;
  return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
}

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
