import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  activeTab: 'login' | 'register' = 'login';

  // Login Form
  loginData = {
    email: '',
    password: ''
  };

  // Register Form
  registerData = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'DRIVER' as 'DRIVER' | 'OPERATOR'
  };

  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
  }

  onLogin() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        // Save User Properly
        if (response.user) {
          localStorage.setItem('userName', response.user.name || response.user.username || 'User');
          localStorage.setItem('userRole', response.user.role || response.user.roles?.[0] || 'Driver');
          localStorage.setItem('userEmail', response.user.email || '');
          localStorage.setItem('token', response.token || '');
        } else if (response.data) {
          // Handle different response structure
          const user = response.data.user || response.data;
          localStorage.setItem('userName', user.name || 'User');
          localStorage.setItem('userRole', user.role || 'Driver');
          localStorage.setItem('userEmail', user.email || '');
        }

        console.log('✅ Login successful. Role saved:', localStorage.getItem('userRole'));

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid email or password';
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  onRegister() {
    this.loading = true;
    this.error = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.success = 'Registration successful! You can now login.';
        this.switchTab('login');
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}