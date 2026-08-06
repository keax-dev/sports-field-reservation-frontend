import { inject, Service, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PAYMENT_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_OPTIONS,
} from '../../../shared/constants/options';
import type { PaginationMeta } from '../../../shared/types/api.types';
import type { Reservation, ReservationStatus } from '../../../shared/types/domain.types';
import { paymentStatusTone, reservationStatusTone } from '../../../shared/utils/domain-presenters';
import { ReservationsApi } from '../data-access/reservations-api';

@Service({ autoProvided: false })
export class ReservationListFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly reservationsApi = inject(ReservationsApi);

  readonly reservations = signal<Reservation[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly filtersForm = this.formBuilder.nonNullable.group({
    status: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  readonly statusOptions = RESERVATION_STATUS_OPTIONS;
  readonly reservationTone = reservationStatusTone;
  readonly paymentTone = paymentStatusTone;

  constructor() {
    void this.loadReservations();
  }

  async loadReservations(page = 1): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const status = this.filtersForm.controls.status.getRawValue();
      const dateFrom = this.filtersForm.controls.dateFrom.getRawValue();
      const dateTo = this.filtersForm.controls.dateTo.getRawValue();

      const response = await firstValueFrom(
        this.reservationsApi.list({
          page,
          ...(status ? { status: status as ReservationStatus } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        }),
      );

      this.reservations.set(response.data);
      this.meta.set(response.meta);
    } catch {
      this.error.set('We could not load your reservations.');
      this.reservations.set([]);
      this.meta.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async applyFilters(): Promise<void> {
    await this.loadReservations(1);
  }

  async goToPage(page: number): Promise<void> {
    const meta = this.meta();

    if (!meta || page < 1 || page > meta.last_page) {
      return;
    }

    await this.loadReservations(page);
  }

  reservationStatusLabel(status: Reservation['status']): string {
    return RESERVATION_STATUS_LABELS[status];
  }

  paymentStatusLabel(status: Reservation['payment_status']): string {
    return PAYMENT_STATUS_LABELS[status];
  }
}
