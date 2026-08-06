import { computed, effect, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from '../../../core/auth/auth-session';
import { NotificationStore } from '../../../core/notifications/notification-store';
import { PAYMENT_METHOD_OPTIONS, SPORT_TYPE_LABELS } from '../../../shared/constants/options';
import { toApiDateTime, toDateTimeLocalValue } from '../../../shared/utils/date-time.utils';
import { getApiErrorMessage } from '../../../shared/utils/http-error.utils';
import type {
  PaymentMethod,
  SportsField,
  User,
  VenueSummary,
} from '../../../shared/types/domain.types';
import { UsersApi } from '../../admin/data-access/users-api';
import { SportsFieldsApi } from '../../sports-fields/data-access/sports-fields-api';
import { ReservationsApi } from '../data-access/reservations-api';

@Service({ autoProvided: false })
export class ReservationCreateFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationsApi = inject(ReservationsApi);
  private readonly sportsFieldsApi = inject(SportsFieldsApi);
  private readonly usersApi = inject(UsersApi);

  readonly authSession = inject(AuthSession);
  readonly notifications = inject(NotificationStore);

  readonly sportsFields = signal<SportsField[]>([]);
  readonly customers = signal<User[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  readonly form = this.formBuilder.nonNullable.group({
    customerId: [''],
    venueId: ['', [Validators.required]],
    sportsFieldId: this.formBuilder.nonNullable.control(
      { value: '', disabled: true },
      { validators: [Validators.required] },
    ),
    startsAt: ['', [Validators.required]],
    endsAt: ['', [Validators.required]],
    paymentMethod: [''],
    notes: [''],
    autoConfirm: [false],
  });

  private readonly selectedVenueValue = toSignal(this.form.controls.venueId.valueChanges, {
    initialValue: this.form.controls.venueId.getRawValue(),
  });

  private readonly selectedSportsFieldValue = toSignal(
    this.form.controls.sportsFieldId.valueChanges,
    {
      initialValue: this.form.controls.sportsFieldId.getRawValue(),
    },
  );

  readonly selectedVenueId = computed(() => {
    const venueId = this.selectedVenueValue();

    return venueId === '' ? null : Number(venueId);
  });

  readonly filteredSportsFields = computed(() => {
    const venueId = this.selectedVenueId();

    if (venueId === null) {
      return [];
    }

    return this.sportsFields()
      .filter((sportsField) => sportsField.venue_id === venueId)
      .sort((left, right) => left.name.localeCompare(right.name));
  });

  readonly venues = computed<VenueSummary[]>(() => {
    const uniqueVenues = new Map<number, VenueSummary>();

    for (const sportsField of this.sportsFields()) {
      if (!sportsField.venue || uniqueVenues.has(sportsField.venue.id)) {
        continue;
      }

      uniqueVenues.set(sportsField.venue.id, sportsField.venue);
    }

    return [...uniqueVenues.values()].sort((left, right) => left.name.localeCompare(right.name));
  });

  private readonly queryParams = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => ({
        venueId: params.get('venueId'),
        sportsFieldId: params.get('sportsFieldId'),
        startsAt: params.get('startsAt'),
        endsAt: params.get('endsAt'),
        customerId: params.get('customerId'),
      })),
    ),
    {
      initialValue: {
        venueId: this.route.snapshot.queryParamMap.get('venueId'),
        sportsFieldId: this.route.snapshot.queryParamMap.get('sportsFieldId'),
        startsAt: this.route.snapshot.queryParamMap.get('startsAt'),
        endsAt: this.route.snapshot.queryParamMap.get('endsAt'),
        customerId: this.route.snapshot.queryParamMap.get('customerId'),
      },
    },
  );

  constructor() {
    effect(() => {
      const queryParams = this.queryParams();

      if (queryParams.venueId) {
        this.form.controls.venueId.setValue(queryParams.venueId);
      }

      if (queryParams.sportsFieldId) {
        this.form.controls.sportsFieldId.setValue(queryParams.sportsFieldId);
      }

      if (queryParams.startsAt) {
        this.form.controls.startsAt.setValue(toDateTimeLocalValue(queryParams.startsAt));
      }

      if (queryParams.endsAt) {
        this.form.controls.endsAt.setValue(toDateTimeLocalValue(queryParams.endsAt));
      }

      if (queryParams.customerId) {
        this.form.controls.customerId.setValue(queryParams.customerId);
      }
    });

    effect(() => {
      const selectedSportsFieldId = this.selectedSportsFieldValue();

      if (selectedSportsFieldId === '') {
        return;
      }

      const selectedSportsField = this.sportsFields().find(
        (sportsField) => sportsField.id === Number(selectedSportsFieldId),
      );

      if (!selectedSportsField) {
        return;
      }

      const currentVenueId = this.form.controls.venueId.getRawValue();
      const expectedVenueId = String(selectedSportsField.venue_id);

      if (currentVenueId !== expectedVenueId) {
        this.form.controls.venueId.setValue(expectedVenueId);
      }
    });

    this.form.controls.venueId.valueChanges.pipe(takeUntilDestroyed()).subscribe((venueId) => {
      const sportsFieldControl = this.form.controls.sportsFieldId;

      if (!venueId) {
        sportsFieldControl.setValue('', { emitEvent: false });
        sportsFieldControl.disable({ emitEvent: false });
        return;
      }

      if (sportsFieldControl.disabled) {
        sportsFieldControl.enable({ emitEvent: false });
      }

      const selectedSportsFieldId = sportsFieldControl.getRawValue();

      if (selectedSportsFieldId === '') {
        return;
      }

      const selectedSportsField = this.sportsFields().find(
        (sportsField) => sportsField.id === Number(selectedSportsFieldId),
      );

      if (!venueId || selectedSportsField?.venue_id !== Number(venueId)) {
        sportsFieldControl.setValue('');
      }
    });

    void this.loadDependencies();
  }

  async loadDependencies(): Promise<void> {
    this.loading.set(true);
    this.formError.set(null);

    try {
      this.sportsFields.set(await this.loadAllSportsFields());

      if (this.authSession.isAdmin()) {
        const customersResponse = await firstValueFrom(this.usersApi.list({ role: 'customer' }));
        this.customers.set(customersResponse.data);
      }
    } catch {
      this.formError.set('We could not load the data needed to create a reservation.');
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (
      (this.authSession.isAdmin() || this.authSession.isStaff()) &&
      !this.form.controls.customerId.getRawValue()
    ) {
      this.formError.set('Please provide the customer identifier for this reservation.');
      return;
    }

    this.submitting.set(true);

    try {
      const customerId = this.form.controls.customerId.getRawValue();

      const createdReservation = await firstValueFrom(
        this.reservationsApi.create({
          ...(!this.authSession.isCustomer() && customerId
            ? { customer_id: Number(customerId) }
            : {}),
          sports_field_id: Number(this.form.controls.sportsFieldId.getRawValue()),
          starts_at: toApiDateTime(this.form.controls.startsAt.getRawValue()),
          ends_at: toApiDateTime(this.form.controls.endsAt.getRawValue()),
          payment_method:
            this.form.controls.paymentMethod.getRawValue() === ''
              ? null
              : (this.form.controls.paymentMethod.getRawValue() as PaymentMethod),
          notes: this.form.controls.notes.getRawValue() || null,
          auto_confirm: this.authSession.isBackoffice()
            ? this.form.controls.autoConfirm.getRawValue()
            : false,
        }),
      );

      this.notifications.show({
        tone: 'success',
        title: 'Reservation created successfully.',
      });
      await this.router.navigate(['/reservations', createdReservation.id]);
    } catch (error: unknown) {
      this.formError.set(getApiErrorMessage(error, 'The reservation could not be created.'));
    } finally {
      this.submitting.set(false);
    }
  }

  sportTypeLabel = (sportType: keyof typeof SPORT_TYPE_LABELS) => SPORT_TYPE_LABELS[sportType];

  private async loadAllSportsFields(): Promise<SportsField[]> {
    const sportsFields: SportsField[] = [];
    let page = 1;

    while (true) {
      const response = await firstValueFrom(this.sportsFieldsApi.list({ page }));
      sportsFields.push(...response.data);

      if (page >= response.meta.last_page) {
        return sportsFields;
      }

      page += 1;
    }
  }
}
