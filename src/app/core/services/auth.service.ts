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
          // Auto login after successful registration (optional)
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      })
    );
  }

  /**
   * Login user
   */
  login(credentials: { email: string; password: string }): Observable<ApiResponseDTO<any>> {
    return this.http.post<ApiResponseDTO<any>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
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
        error: () => {} // Ignore errors on logout
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
  
}
