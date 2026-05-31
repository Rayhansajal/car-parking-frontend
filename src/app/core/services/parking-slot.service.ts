import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParkingSlot, ParkingSlotRequestDTO } from '../../models/parking-slot.model';

@Injectable({
  providedIn: 'root'
})
export class ParkingSlotService {
  private apiUrl = 'http://localhost:8080/api/slots';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, search?: string): Observable<unknown> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get(url);
  }

  getByLot(lotId: number): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/lot/${lotId}`);
  }

  create(slot: ParkingSlotRequestDTO): Observable<ParkingSlot> {
    return this.http.post<ParkingSlot>(this.apiUrl, slot);
  }

  update(id: number, slot: ParkingSlotRequestDTO): Observable<ParkingSlot> {
    return this.http.put<ParkingSlot>(`${this.apiUrl}/${id}`, slot);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
