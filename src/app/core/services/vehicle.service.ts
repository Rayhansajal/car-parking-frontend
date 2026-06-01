import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VehicleRequestDTO, VehicleResponseDTO } from '../../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/api/vehicles`;

  constructor(private http: HttpClient) {}

  getMyVehicles(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/my`);
  }

  getByUser(userId: number): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getById(id: number): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(vehicle: VehicleRequestDTO): Observable<VehicleResponseDTO> {
    return this.http.post<VehicleResponseDTO>(this.apiUrl, vehicle);
  }

  update(id: number, vehicle: VehicleRequestDTO): Observable<VehicleResponseDTO> {
    return this.http.put<VehicleResponseDTO>(`${this.apiUrl}/${id}`, vehicle);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
