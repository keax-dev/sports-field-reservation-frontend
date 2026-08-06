import { DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificationStore } from '../../../core/notifications/notification-store';
import type { Venue } from '../../../shared/types/domain.types';
import { activeTone } from '../../../shared/utils/domain-presenters';
import { getApiErrorMessage } from '../../../shared/utils/http-error.utils';
import { VenuesApi } from '../../venues/data-access/venues-api';

@Service({ autoProvided: false })
export class VenueManagementFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly venuesApi = inject(VenuesApi);
  private readonly notifications = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly venues = signal<Venue[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingVenueId = signal<number | null>(null);
  readonly toneForActive = activeTone;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    city: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    isActive: [true],
  });

  constructor() {
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading.set(true);
    this.error.set(null);

    this.venuesApi
      .list({
        includeInactive: true,
        includeFields: true,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.venues.set(response.data);
        },
        error: () => {
          this.error.set('We could not load venues.');
          this.venues.set([]);
        },
      });
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

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = {
      name: this.form.controls.name.getRawValue(),
      address: this.form.controls.address.getRawValue(),
      city: this.form.controls.city.getRawValue(),
      description: this.form.controls.description.getRawValue() || null,
      is_active: this.form.controls.isActive.getRawValue(),
    };

    const venueId = this.editingVenueId();
    const request$ =
      venueId === null ? this.venuesApi.create(payload) : this.venuesApi.update(venueId, payload);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.saving.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.notifications.show({
            tone: 'success',
            title: venueId === null ? 'Venue created successfully.' : 'Venue updated successfully.',
          });
          this.resetForm();
          this.loadVenues();
        },
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error, 'The venue could not be saved.'));
        },
      });
  }
}
