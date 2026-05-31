import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingRequestDTO } from '../../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/api/bookings`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<unknown> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getMyBookings(page = 0, size = 20): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/my?page=${page}&size=${size}`);
  }

  create(booking: BookingRequestDTO): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  cancel(id: number): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, {});
  }

  checkIn(id: number): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/${id}/checkin`, {});
  }

  checkOut(id: number): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/${id}/checkout`, {});
  }
}
