import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
} from '../../../../shared/constants/options';
import type { PaymentMethod, Reservation } from '../../../../shared/types/domain.types';
import {
  paymentStatusTone,
  reservationStatusTone,
} from '../../../../shared/utils/domain-presenters';
import { getApiErrorMessage } from '../../../../shared/utils/http-error.utils';
import { ReservationsApi } from '../../data-access/reservations-api';

@Component({
  selector: 'app-reservation-detail-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
    ...HlmTextareaImports,
  ],
  templateUrl: './reservation-detail-page.html',
  styleUrl: './reservation-detail-page.css',
})
export class ReservationDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly reservationsApi = inject(ReservationsApi);

  readonly reservation = signal<Reservation | null>(null);
  readonly loading = signal(true);
  readonly actionError = signal<string | null>(null);
  readonly processingConfirm = signal(false);
  readonly processingCancel = signal(false);

  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  readonly confirmForm = this.formBuilder.nonNullable.group({
    paymentMethod: ['cash', [Validators.required]],
    paymentReference: [''],
  });

  readonly cancelForm = this.formBuilder.nonNullable.group({
    reason: ['', [Validators.required]],
  });

  private readonly reservationId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('reservationId')))),
    {
      initialValue: Number(this.route.snapshot.paramMap.get('reservationId')),
    },
  );

  constructor() {
    effect(() => {
      const reservationId = this.reservationId();

      if (Number.isFinite(reservationId) && reservationId > 0) {
        void this.loadReservation(reservationId);
      }
    });
  }

  async loadReservation(reservationId: number): Promise<void> {
    this.loading.set(true);
    this.actionError.set(null);

    try {
      const reservation = await firstValueFrom(this.reservationsApi.get(reservationId));
      this.reservation.set(reservation);
    } catch {
      this.actionError.set('We could not load this reservation.');
      this.reservation.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async confirmReservation(): Promise<void> {
    const reservation = this.reservation();

    if (!reservation || this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.processingConfirm.set(true);
    this.actionError.set(null);

    try {
      const updatedReservation = await firstValueFrom(
        this.reservationsApi.confirm(reservation.id, {
          payment_method: this.confirmForm.controls.paymentMethod.getRawValue() as PaymentMethod,
          payment_reference: this.confirmForm.controls.paymentReference.getRawValue() || null,
        }),
      );

      this.reservation.set(updatedReservation);
    } catch (error: unknown) {
      this.actionError.set(getApiErrorMessage(error, 'The reservation could not be confirmed.'));
    } finally {
      this.processingConfirm.set(false);
    }
  }

  async cancelReservation(): Promise<void> {
    const reservation = this.reservation();

    if (!reservation || this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    this.processingCancel.set(true);
    this.actionError.set(null);

    try {
      const updatedReservation = await firstValueFrom(
        this.reservationsApi.cancel(reservation.id, {
          reason: this.cancelForm.controls.reason.getRawValue(),
        }),
      );

      this.reservation.set(updatedReservation);
    } catch (error: unknown) {
      this.actionError.set(getApiErrorMessage(error, 'The reservation could not be cancelled.'));
    } finally {
      this.processingCancel.set(false);
    }
  }

  reservationStatusLabel(status: Reservation['status']): string {
    return RESERVATION_STATUS_LABELS[status];
  }

  paymentStatusLabel(status: Reservation['payment_status']): string {
    return PAYMENT_STATUS_LABELS[status];
  }

  canConfirm(reservation: Reservation): boolean {
    return reservation.status === 'pending';
  }

  canCancel(reservation: Reservation): boolean {
    return reservation.status === 'pending' || reservation.status === 'confirmed';
  }

  reservationTone = reservationStatusTone;
  paymentTone = paymentStatusTone;
}
