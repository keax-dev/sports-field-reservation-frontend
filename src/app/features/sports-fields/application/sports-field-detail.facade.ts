import { effect, inject, Service, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from '../../../core/auth/auth-session';
import { SPORT_TYPE_LABELS } from '../../../shared/constants/options';
import { activeTone } from '../../../shared/utils/domain-presenters';
import { getApiErrorMessage } from '../../../shared/utils/http-error.utils';
import { toTomorrowDateInputValue } from '../../../shared/utils/date-time.utils';
import type { AvailabilitySlot, SportsField } from '../../../shared/types/domain.types';
import { SportsFieldsApi } from '../data-access/sports-fields-api';

@Service({ autoProvided: false })
export class SportsFieldDetailFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly sportsFieldsApi = inject(SportsFieldsApi);

  readonly authSession = inject(AuthSession);
  readonly sportsField = signal<SportsField | null>(null);
  readonly availability = signal<AvailabilitySlot[]>([]);
  readonly loading = signal(true);
  readonly availabilityLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly availabilityError = signal<string | null>(null);
  readonly toneForActive = activeTone;
  readonly sportTypeLabel = (sportType: keyof typeof SPORT_TYPE_LABELS) =>
    SPORT_TYPE_LABELS[sportType];

  readonly searchForm = this.formBuilder.nonNullable.group({
    date: [toTomorrowDateInputValue(), [Validators.required]],
    durationMinutes: ['60', [Validators.required]],
  });

  private readonly sportsFieldId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('sportsFieldId')))),
    {
      initialValue: Number(this.route.snapshot.paramMap.get('sportsFieldId')),
    },
  );

  readonly durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '120 minutes' },
  ] as const;

  constructor() {
    effect(() => {
      const sportsFieldId = this.sportsFieldId();

      if (Number.isFinite(sportsFieldId) && sportsFieldId > 0) {
        void this.loadSportsField(sportsFieldId);
      }
    });
  }

  async loadSportsField(sportsFieldId: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const sportsField = await firstValueFrom(this.sportsFieldsApi.get(sportsFieldId));
      this.sportsField.set(sportsField);
      await this.searchAvailability();
    } catch {
      this.error.set('We could not load this sports field.');
      this.sportsField.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async searchAvailability(): Promise<void> {
    const sportsField = this.sportsField();

    if (!sportsField || this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.availabilityLoading.set(true);
    this.availabilityError.set(null);

    try {
      const slots = await firstValueFrom(
        this.sportsFieldsApi.getAvailability(sportsField.id, {
          date: this.searchForm.controls.date.getRawValue(),
          durationMinutes: Number(this.searchForm.controls.durationMinutes.getRawValue()),
        }),
      );

      this.availability.set(slots);
    } catch (error: unknown) {
      this.availabilityError.set(
        getApiErrorMessage(error, 'We could not load availability for the selected date.'),
      );
      this.availability.set([]);
    } finally {
      this.availabilityLoading.set(false);
    }
  }

  goToReservation(slot: AvailabilitySlot): void {
    const sportsField = this.sportsField();

    if (!sportsField) {
      return;
    }

    void this.router.navigate(['/reservations/new'], {
      queryParams: {
        sportsFieldId: sportsField.id,
        startsAt: slot.starts_at,
        endsAt: slot.ends_at,
      },
    });
  }
}
