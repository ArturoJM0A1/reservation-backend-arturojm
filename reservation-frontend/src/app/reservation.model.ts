export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: number | null;
  customerName: string;
  date: string;
  time: string;
  service: string;
  status: ReservationStatus;
}

export interface CreateReservationRequest {
  customerName: string;
  date: string;
  time: string;
  service: string;
}
