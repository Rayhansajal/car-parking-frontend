import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponseDTO } from '../../models/api-response.model';
import { DashboardResponseDTO } from '../../models/dashboard.model';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/api/reports/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponseDTO<DashboardResponseDTO>> {
    return this.http.get<ApiResponseDTO<DashboardResponseDTO>>(this.apiUrl);
  }
}
