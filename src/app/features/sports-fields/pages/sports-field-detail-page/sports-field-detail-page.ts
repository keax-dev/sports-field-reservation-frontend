import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { AuthSession } from '../../../../core/auth/auth-session';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { SPORT_TYPE_LABELS } from '../../../../shared/constants/options';
import { activeTone } from '../../../../shared/utils/domain-presenters';
import { getApiErrorMessage } from '../../../../shared/utils/http-error.utils';
import { toTomorrowDateInputValue } from '../../../../shared/utils/date-time.utils';
import type { AvailabilitySlot, SportsField } from '../../../../shared/types/domain.types';
import { SportsFieldsApi } from '../../data-access/sports-fields-api';

@Component({
  selector: 'app-sports-field-detail-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
  ],
  templateUrl: './sports-field-detail-page.html',
  styleUrl: './sports-field-detail-page.css',
})
export class SportsFieldDetailPage {
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

  sportTypeLabel = (sportType: keyof typeof SPORT_TYPE_LABELS) => SPORT_TYPE_LABELS[sportType];
  toneForActive = activeTone;
}
