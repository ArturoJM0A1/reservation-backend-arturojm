import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { ReservationApiService } from './reservation-api.service';

describe('App', () => {
  let reservationApiSpy: jasmine.SpyObj<ReservationApiService>;

  beforeEach(async () => {
    reservationApiSpy = jasmine.createSpyObj<ReservationApiService>('ReservationApiService', [
      'listReservations',
      'createReservation',
      'cancelReservation'
    ]);
    reservationApiSpy.listReservations.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: ReservationApiService, useValue: reservationApiSpy }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the reservation heading', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Reservas');
  });
});
