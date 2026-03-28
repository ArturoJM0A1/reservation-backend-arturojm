import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateReservationRequest, Reservation } from './reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/reservas';

  listReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.endpoint);
  }

  createReservation(payload: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.endpoint, payload);
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
