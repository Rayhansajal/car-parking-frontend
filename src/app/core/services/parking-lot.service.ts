import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParkingLot, ParkingLotRequestDTO } from '../../models/parking-lot.model';

@Injectable({
  providedIn: 'root'
})
export class ParkingLotService {
  private apiUrl = 'http://localhost:8080/api/lots';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, search?: string): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get(url);
  }

  getActiveLots(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<ParkingLot> {
    return this.http.get<ParkingLot>(`${this.apiUrl}/${id}`);
  }

  create(lot: ParkingLotRequestDTO): Observable<ParkingLot> {
    return this.http.post<ParkingLot>(this.apiUrl, lot);
  }

  update(id: number, lot: ParkingLotRequestDTO): Observable<ParkingLot> {
    return this.http.put<ParkingLot>(`${this.apiUrl}/${id}`, lot);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
