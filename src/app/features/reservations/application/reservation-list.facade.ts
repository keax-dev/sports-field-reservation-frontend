import { DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import {
  PAYMENT_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_OPTIONS,
} from '../../../shared/constants/options';
import type { PaginationMeta } from '../../../shared/types/api.types';
import type { Reservation, ReservationStatus } from '../../../shared/types/domain.types';
import { paymentStatusTone, reservationStatusTone } from '../../../shared/utils/domain-presenters';
import { VenuesApi } from '../../venues/data-access/venues-api';
import { ReservationsApi } from '../data-access/reservations-api';

@Service({ autoProvided: false })
export class ReservationListFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly reservationsApi = inject(ReservationsApi);
  private readonly venuesApi = inject(VenuesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly reservations = signal<Reservation[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private readonly venueNames = signal<Record<number, string>>({});

  readonly filtersForm = this.formBuilder.nonNullable.group({
    status: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  readonly statusOptions = RESERVATION_STATUS_OPTIONS;
  readonly reservationTone = reservationStatusTone;
  readonly paymentTone = paymentStatusTone;

  constructor() {
    this.loadReservations();
  }

  loadReservations(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.filtersForm.controls.status.getRawValue();
    const dateFrom = this.filtersForm.controls.dateFrom.getRawValue();
    const dateTo = this.filtersForm.controls.dateTo.getRawValue();

    this.reservationsApi
      .list({
        page,
        ...(status ? { status: status as ReservationStatus } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.reservations.set(response.data);
          this.meta.set(response.meta);
          this.loadVenueNames(response.data);
        },
        error: () => {
          this.error.set('We could not load your reservations.');
          this.reservations.set([]);
          this.meta.set(null);
        },
      });
  }

  applyFilters(): void {
    this.loadReservations(1);
  }

  goToPage(page: number): void {
    const meta = this.meta();

    if (!meta || page < 1 || page > meta.last_page) {
      return;
    }

    this.loadReservations(page);
  }

  reservationStatusLabel(status: Reservation['status']): string {
    return RESERVATION_STATUS_LABELS[status];
  }

  paymentStatusLabel(status: Reservation['payment_status']): string {
    return PAYMENT_STATUS_LABELS[status];
  }

  venueLabel(reservation: Reservation): string {
    if (reservation.venue_id <= 0) {
      return 'Venue unavailable';
    }

    return this.venueNames()[reservation.venue_id] ?? 'Loading venue...';
  }

  private loadVenueNames(reservations: Reservation[]): void {
    const knownVenueNames = this.venueNames();
    const missingVenueIds = [...new Set(reservations.map((reservation) => reservation.venue_id))]
      .filter((venueId) => venueId > 0)
      .filter((venueId) => !(venueId in knownVenueNames));

    if (missingVenueIds.length === 0) {
      return;
    }

    forkJoin(
      missingVenueIds.map((venueId) =>
        this.venuesApi.get(venueId).pipe(
          map((venue) => ({
            venueId,
            venueName: venue.name,
          })),
          catchError(() => of(null)),
        ),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((venueResults) => {
        this.venueNames.update((currentVenueNames) => {
          const nextVenueNames = { ...currentVenueNames };

          for (const result of venueResults) {
            if (result !== null) {
              nextVenueNames[result.venueId] = result.venueName;
            }
          }

          return nextVenueNames;
        });
      });
  }
}
