import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ReservationApiService } from './reservation-api.service';
import { CreateReservationRequest, Reservation } from './reservation.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, DatePipe, SlicePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly reservationApi = inject(ReservationApiService);

  protected readonly serviceOptions = [
    'Corte premium',
    'Color completo',
    'Masaje de 60 min',
    'Manicure express'
  ];

  protected readonly reservationForm = this.formBuilder.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(100)]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    service: ['Corte premium', [Validators.required, Validators.maxLength(50)]]
  });

  protected readonly reservations = signal<Reservation[]>([]);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly cancellingId = signal<number | null>(null);
  protected readonly feedback = signal<string | null>(null);
  protected readonly feedbackTone = signal<'success' | 'error' | null>(null);

  protected readonly totalReservations = computed(() => this.reservations().length);
  protected readonly activeReservations = computed(
    () => this.reservations().filter((reservation) => reservation.status !== 'CANCELLED').length
  );
  protected readonly pendingReservations = computed(
    () => this.reservations().filter((reservation) => reservation.status === 'PENDING').length
  );

  ngOnInit(): void {
    this.loadReservations();
  }

  protected createReservation(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    const payload: CreateReservationRequest = this.reservationForm.getRawValue();

    this.submitting.set(true);
    this.clearFeedback();

    this.reservationApi
      .createReservation(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (createdReservation) => {
          this.reservations.update((currentReservations) =>
            this.sortReservations([...currentReservations, createdReservation])
          );
          this.reservationForm.reset({
            customerName: '',
            date: '',
            time: '',
            service: 'Corte premium'
          });
          this.setFeedback('Reserva creada correctamente.', 'success');
        },
        error: (error) => {
          this.setFeedback(this.getCreateReservationErrorMessage(error), 'error');
        }
      });
  }

  protected refreshReservations(): void {
    this.loadReservations();
  }

  protected cancelReservation(reservation: Reservation): void {
    if (!reservation.id || reservation.status === 'CANCELLED') {
      return;
    }

    this.cancellingId.set(reservation.id);
    this.clearFeedback();

    this.reservationApi
      .cancelReservation(reservation.id)
      .pipe(finalize(() => this.cancellingId.set(null)))
      .subscribe({
        next: () => {
          this.reservations.update((currentReservations) =>
            this.sortReservations(
              currentReservations.map((currentReservation) =>
                currentReservation.id === reservation.id
                  ? { ...currentReservation, status: 'CANCELLED' }
                  : currentReservation
              )
            )
          );
          this.setFeedback('Reserva cancelada.', 'success');
        },
        error: (error) => {
          this.setFeedback(
            this.getErrorMessage(error, 'No fue posible cancelar la reserva.'),
            'error'
          );
        }
      });
  }

  protected isFieldInvalid(fieldName: 'customerName' | 'date' | 'time' | 'service'): boolean {
    const control = this.reservationForm.controls[fieldName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected isCancelled(reservation: Reservation): boolean {
    return reservation.status === 'CANCELLED';
  }

  protected trackByReservationId(index: number, reservation: Reservation): string | number {
    return reservation.id ?? `${reservation.customerName}-${reservation.date}-${reservation.time}-${index}`;
  }

  private loadReservations(): void {
    this.loading.set(true);
    this.clearFeedback();

    this.reservationApi
      .listReservations()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (reservations) => {
          this.reservations.set(this.sortReservations(reservations));
          this.setFeedback('conexion exitosa a la base de datos', 'success');
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.reservations.set([]);
            return;
          }

          this.reservations.set([]);
          this.setFeedback(
            this.getErrorMessage(error, 'No fue posible cargar las reservas.'),
            'error'
          );
        }
      });
  }

  private sortReservations(reservations: Reservation[]): Reservation[] {
    return [...reservations].sort((firstReservation, secondReservation) => {
      const firstId = firstReservation.id ?? Number.MAX_SAFE_INTEGER;
      const secondId = secondReservation.id ?? Number.MAX_SAFE_INTEGER;
      return firstId - secondId;
    });
  }

  private setFeedback(message: string, tone: 'success' | 'error'): void {
    this.feedback.set(message);
    this.feedbackTone.set(tone);
  }

  private clearFeedback(): void {
    this.feedback.set(null);
    this.feedbackTone.set(null);
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      if (this.isDatabaseConnectionPayload(error.error)) {
        return 'No se pudo conectar con la base de datos.';
      }

      const apiMessage = this.extractApiMessage(error);

      if (apiMessage) {
        return apiMessage;
      }
    }

    return fallbackMessage;
  }

  private getCreateReservationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (this.isDatabaseConnectionPayload(error.error)) {
        return 'No fue posible crear la reserva porque no se pudo conectar con la base de datos.';
      }

      const apiMessage = this.extractApiMessage(error);

      if (apiMessage) {
        return `No fue posible crear la reserva porque ${this.normalizeReason(apiMessage)}`;
      }

      if (error.status === 0) {
        return 'No fue posible crear la reserva porque el backend no responde. Verifica que Spring Boot esté corriendo en http://localhost:8080.';
      }

      if (error.status === 400) {
        return 'No fue posible crear la reserva porque faltan datos o alguno tiene un formato invalido.';
      }

      if (error.status === 404) {
        return 'No fue posible crear la reserva porque el endpoint /reservas no esta disponible.';
      }

      if (error.status >= 500) {
        return 'No fue posible crear la reserva porque el servidor devolvio un error interno.';
      }
    }

    return 'No fue posible crear la reserva porque ocurrio un error inesperado.';
  }

  private extractApiMessage(error: HttpErrorResponse): string | null {
    if (
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return null;
  }

  private isDatabaseConnectionPayload(payload: unknown): boolean {
    if (typeof payload === 'string') {
      return this.isDatabaseConnectionMessage(payload);
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
    ) {
      return this.isDatabaseConnectionMessage(payload.message);
    }

    return false;
  }

  private isDatabaseConnectionMessage(message: string): boolean {
    const normalizedMessage = message.toLowerCase();

    return (
      normalizedMessage.includes('base de datos') ||
      normalizedMessage.includes('database') ||
      normalizedMessage.includes('jdbc') ||
      normalizedMessage.includes('datasource') ||
      normalizedMessage.includes('unable to acquire jdbc connection') ||
      normalizedMessage.includes('could not open jpa entitymanager') ||
      normalizedMessage.includes('connection refused')
    );
  }

  private normalizeReason(message: string): string {
    return message.trim().replace(/\.$/, '').toLowerCase();
  }
}
