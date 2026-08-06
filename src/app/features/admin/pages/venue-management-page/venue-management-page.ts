import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NotificationStore } from '../../../../core/notifications/notification-store';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import type { Venue } from '../../../../shared/types/domain.types';
import { activeTone } from '../../../../shared/utils/domain-presenters';
import { getApiErrorMessage } from '../../../../shared/utils/http-error.utils';
import { VenuesApi } from '../../../venues/data-access/venues-api';

@Component({
  selector: 'app-venue-management-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmTextareaImports,
  ],
  templateUrl: './venue-management-page.html',
  styleUrl: './venue-management-page.css',
})
export class VenueManagementPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly venuesApi = inject(VenuesApi);
  private readonly notifications = inject(NotificationStore);

  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingVenueId = signal<number | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    city: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    isActive: [true],
  });

  constructor() {
    void this.loadVenues();
  }

  async loadVenues(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.venuesApi.list({
          includeInactive: true,
          includeFields: true,
        }),
      );

      this.venues.set(response.data);
    } catch {
      this.error.set('We could not load venues.');
      this.venues.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  editVenue(venue: Venue): void {
    this.editingVenueId.set(venue.id);
    this.form.setValue({
      name: venue.name,
      address: venue.address,
      city: venue.city,
      description: venue.description ?? '',
      isActive: venue.is_active,
    });
  }

  resetForm(): void {
    this.editingVenueId.set(null);
    this.form.reset({
      name: '',
      address: '',
      city: '',
      description: '',
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
        name: this.form.controls.name.getRawValue(),
        address: this.form.controls.address.getRawValue(),
        city: this.form.controls.city.getRawValue(),
        description: this.form.controls.description.getRawValue() || null,
        is_active: this.form.controls.isActive.getRawValue(),
      };

      const venueId = this.editingVenueId();

      if (venueId === null) {
        await firstValueFrom(this.venuesApi.create(payload));
        this.notifications.show({
          tone: 'success',
          title: 'Venue created successfully.',
        });
      } else {
        await firstValueFrom(this.venuesApi.update(venueId, payload));
        this.notifications.show({
          tone: 'success',
          title: 'Venue updated successfully.',
        });
      }

      this.resetForm();
      await this.loadVenues();
    } catch (error: unknown) {
      this.error.set(getApiErrorMessage(error, 'The venue could not be saved.'));
    } finally {
      this.saving.set(false);
    }
  }

  toneForActive = activeTone;
}
