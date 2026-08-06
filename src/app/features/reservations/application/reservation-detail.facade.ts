import { DestroyRef, effect, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, map } from 'rxjs';
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
} from '../../../shared/constants/options';
import type { PaymentMethod, Reservation } from '../../../shared/types/domain.types';
import { paymentStatusTone, reservationStatusTone } from '../../../shared/utils/domain-presenters';
import { getApiErrorMessage } from '../../../shared/utils/http-error.utils';
import { ReservationsApi } from '../data-access/reservations-api';

@Service({ autoProvided: false })
export class ReservationDetailFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly reservationsApi = inject(ReservationsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly reservation = signal<Reservation | null>(null);
  readonly loading = signal(true);
  readonly actionError = signal<string | null>(null);
  readonly processingConfirm = signal(false);
  readonly processingCancel = signal(false);

  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;
  readonly reservationTone = reservationStatusTone;
  readonly paymentTone = paymentStatusTone;

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
        this.loadReservation(reservationId);
      }
    });
  }

  loadReservation(reservationId: number): void {
    this.loading.set(true);
    this.actionError.set(null);

    this.reservationsApi
      .get(reservationId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (reservation) => {
          this.reservation.set(reservation);
        },
        error: () => {
          this.actionError.set('We could not load this reservation.');
          this.reservation.set(null);
        },
      });
  }

  confirmReservation(): void {
    const reservation = this.reservation();

    if (!reservation || this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.processingConfirm.set(true);
    this.actionError.set(null);

    this.reservationsApi
      .confirm(reservation.id, {
        payment_method: this.confirmForm.controls.paymentMethod.getRawValue() as PaymentMethod,
        payment_reference: this.confirmForm.controls.paymentReference.getRawValue() || null,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.processingConfirm.set(false);
        }),
      )
      .subscribe({
        next: (updatedReservation) => {
          this.reservation.set(updatedReservation);
        },
        error: (error: unknown) => {
          this.actionError.set(
            getApiErrorMessage(error, 'The reservation could not be confirmed.'),
          );
        },
      });
  }

  cancelReservation(): void {
    const reservation = this.reservation();

    if (!reservation || this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    this.processingCancel.set(true);
    this.actionError.set(null);

    this.reservationsApi
      .cancel(reservation.id, {
        reason: this.cancelForm.controls.reason.getRawValue(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.processingCancel.set(false);
        }),
      )
      .subscribe({
        next: (updatedReservation) => {
          this.reservation.set(updatedReservation);
        },
        error: (error: unknown) => {
          this.actionError.set(
            getApiErrorMessage(error, 'The reservation could not be cancelled.'),
          );
        },
      });
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
}
