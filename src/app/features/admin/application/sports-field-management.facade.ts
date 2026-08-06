import { inject, Service, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NotificationStore } from '../../../core/notifications/notification-store';
import { SPORT_TYPE_LABELS, SPORT_TYPE_OPTIONS } from '../../../shared/constants/options';
import type { SportType, SportsField, Venue } from '../../../shared/types/domain.types';
import { activeTone } from '../../../shared/utils/domain-presenters';
import { getApiErrorMessage } from '../../../shared/utils/http-error.utils';
import { SportsFieldsApi } from '../../sports-fields/data-access/sports-fields-api';
import { VenuesApi } from '../../venues/data-access/venues-api';

@Service({ autoProvided: false })
export class SportsFieldManagementFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly sportsFieldsApi = inject(SportsFieldsApi);
  private readonly venuesApi = inject(VenuesApi);
  private readonly notifications = inject(NotificationStore);

  readonly sportsFields = signal<SportsField[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingSportsFieldId = signal<number | null>(null);
  readonly sportTypeOptions = SPORT_TYPE_OPTIONS;
  readonly toneForActive = activeTone;
  readonly sportTypeLabel = (sportType: keyof typeof SPORT_TYPE_LABELS) =>
    SPORT_TYPE_LABELS[sportType];

  readonly form = this.formBuilder.nonNullable.group({
    venueId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    sportType: ['football', [Validators.required]],
    description: [''],
    hourlyRate: ['', [Validators.required]],
    openTime: ['08:00', [Validators.required]],
    closeTime: ['22:00', [Validators.required]],
    maxPlayers: [''],
    isActive: [true],
  });

  constructor() {
    void this.loadDependencies();
  }

  async loadDependencies(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [venuesResponse, sportsFieldsResponse] = await Promise.all([
        firstValueFrom(this.venuesApi.list({ includeInactive: true })),
        firstValueFrom(this.sportsFieldsApi.list({ includeInactive: true })),
      ]);

      this.venues.set(venuesResponse.data);
      this.sportsFields.set(sportsFieldsResponse.data);
    } catch {
      this.error.set('We could not load sports fields.');
      this.venues.set([]);
      this.sportsFields.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  editSportsField(sportsField: SportsField): void {
    this.editingSportsFieldId.set(sportsField.id);
    this.form.setValue({
      venueId: String(sportsField.venue_id),
      name: sportsField.name,
      sportType: sportsField.sport_type,
      description: sportsField.description ?? '',
      hourlyRate: sportsField.hourly_rate,
      openTime: sportsField.open_time.slice(0, 5),
      closeTime: sportsField.close_time.slice(0, 5),
      maxPlayers: sportsField.max_players ? String(sportsField.max_players) : '',
      isActive: sportsField.is_active,
    });
  }

  resetForm(): void {
    this.editingSportsFieldId.set(null);
    this.form.reset({
      venueId: '',
      name: '',
      sportType: 'football',
      description: '',
      hourlyRate: '',
      openTime: '08:00',
      closeTime: '22:00',
      maxPlayers: '',
      isActive: true,
    });
  }

  async submit(): Promise<void> {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      const payload = {
        venue_id: Number(this.form.controls.venueId.getRawValue()),
        name: this.form.controls.name.getRawValue(),
        sport_type: this.form.controls.sportType.getRawValue() as SportType,
        description: this.form.controls.description.getRawValue() || null,
        hourly_rate: this.form.controls.hourlyRate.getRawValue(),
        open_time: this.form.controls.openTime.getRawValue(),
        close_time: this.form.controls.closeTime.getRawValue(),
        ...(this.form.controls.maxPlayers.getRawValue()
          ? { max_players: Number(this.form.controls.maxPlayers.getRawValue()) }
          : {}),
        is_active: this.form.controls.isActive.getRawValue(),
      };

      const sportsFieldId = this.editingSportsFieldId();

      if (sportsFieldId === null) {
        await firstValueFrom(this.sportsFieldsApi.create(payload));
        this.notifications.show({
          tone: 'success',
          title: 'Sports field created successfully.',
        });
      } else {
        await firstValueFrom(this.sportsFieldsApi.update(sportsFieldId, payload));
        this.notifications.show({
          tone: 'success',
          title: 'Sports field updated successfully.',
        });
      }

      this.resetForm();
      await this.loadDependencies();
    } catch (error: unknown) {
      this.error.set(getApiErrorMessage(error, 'The sports field could not be saved.'));
    } finally {
      this.saving.set(false);
    }
  }
}
