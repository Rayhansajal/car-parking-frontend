import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponseDTO } from '../../models/api-response.model';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   */
  register(registerData: any): Observable<ApiResponseDTO<any>> {
    return this.http.post<ApiResponseDTO<any>>(`${this.apiUrl}/register`, registerData).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      })
    );
  }

  /**
   * Login user - Now properly saves user info
   */
  login(credentials: { email: string; password: string }): Observable<ApiResponseDTO<any>> {
    return this.http.post<ApiResponseDTO<any>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          
          // Save tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // ✅ IMPORTANT: Save user information
          const user = response.data.user || response.data;

          if (user) {
            localStorage.setItem('userName', user.name || user.username || 'User');
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userRole', user.role || user.roles?.[0] || 'DRIVER');
            
            console.log('✅ User data saved successfully');
            console.log('Role saved:', localStorage.getItem('userRole'));
          }
        }
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        error: () => {} 
      });
    }
    localStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ NEW: Add this method
  hasRole(role: string): boolean {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) return false;

    const roleUpper = userRole.toUpperCase().trim();
    const required = role.toUpperCase().trim();

    return roleUpper === required || 
           roleUpper === `ROLE_${required}` ||
           roleUpper.includes(required);
  }

  // Optional: Get current user info
  getCurrentUser() {
    return {
      name: localStorage.getItem('userName'),
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('userRole')
    };
  }
}