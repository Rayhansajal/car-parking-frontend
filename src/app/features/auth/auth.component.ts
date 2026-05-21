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
      next: () => {
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
        this.switchTab('login'); // Switch to login tab after successful register
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

}
