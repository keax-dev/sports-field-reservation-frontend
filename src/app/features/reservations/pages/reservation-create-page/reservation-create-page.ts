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
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { AuthSession } from '../../../../core/auth/auth-session';
import { NotificationStore } from '../../../../core/notifications/notification-store';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PAYMENT_METHOD_OPTIONS, SPORT_TYPE_LABELS } from '../../../../shared/constants/options';
import { toApiDateTime, toDateTimeLocalValue } from '../../../../shared/utils/date-time.utils';
import { getApiErrorMessage } from '../../../../shared/utils/http-error.utils';
import type { PaymentMethod, SportsField, User } from '../../../../shared/types/domain.types';
import { UsersApi } from '../../../admin/data-access/users-api';
import { SportsFieldsApi } from '../../../sports-fields/data-access/sports-fields-api';
import { ReservationsApi } from '../../data-access/reservations-api';

@Component({
  selector: 'app-reservation-create-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeader,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
    ...HlmTextareaImports,
  ],
  templateUrl: './reservation-create-page.html',
  styleUrl: './reservation-create-page.css',
})
export class ReservationCreatePage {
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
    sportsFieldId: ['', [Validators.required]],
    startsAt: ['', [Validators.required]],
    endsAt: ['', [Validators.required]],
    paymentMethod: [''],
    notes: [''],
    autoConfirm: [false],
  });

  private readonly queryParams = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => ({
        sportsFieldId: params.get('sportsFieldId'),
        startsAt: params.get('startsAt'),
        endsAt: params.get('endsAt'),
        customerId: params.get('customerId'),
      })),
    ),
    {
      initialValue: {
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

    void this.loadDependencies();
  }

  async loadDependencies(): Promise<void> {
    this.loading.set(true);
    this.formError.set(null);

    try {
      const sportsFieldsResponse = await firstValueFrom(this.sportsFieldsApi.list());
      this.sportsFields.set(sportsFieldsResponse.data);

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
}
