import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { NotificationStore } from '../../../../core/notifications/notification-store';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { USER_ROLE_LABELS, USER_ROLE_OPTIONS } from '../../../../shared/constants/options';
import type { PaginationMeta } from '../../../../shared/types/api.types';
import type { User, UserRole, Venue } from '../../../../shared/types/domain.types';
import { getApiErrorMessage } from '../../../../shared/utils/http-error.utils';
import { roleTone } from '../../../../shared/utils/domain-presenters';
import { UsersApi } from '../../data-access/users-api';
import { VenuesApi } from '../../../venues/data-access/venues-api';

@Component({
  selector: 'app-user-management-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
  ],
  templateUrl: './user-management-page.html',
  styleUrl: './user-management-page.css',
})
export class UserManagementPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersApi = inject(UsersApi);
  private readonly venuesApi = inject(VenuesApi);
  private readonly notifications = inject(NotificationStore);

  readonly users = signal<User[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedVenueIds = signal<number[]>([]);

  readonly roleOptions = USER_ROLE_OPTIONS;
  readonly isStaffRole = computed(() => this.createForm.controls.role.getRawValue() === 'staff');

  readonly filterForm = this.formBuilder.nonNullable.group({
    search: [''],
    role: [''],
  });

  readonly createForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required]],
    role: ['customer'],
  });

  constructor() {
    this.createForm.controls.role.valueChanges.pipe(takeUntilDestroyed()).subscribe((role) => {
      if (role !== 'staff') {
        this.selectedVenueIds.set([]);
      }
    });

    void this.loadDependencies();
  }

  async loadDependencies(page = 1): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const search = this.filterForm.controls.search.getRawValue();
      const role = this.filterForm.controls.role.getRawValue();

      const [venuesResponse, usersResponse] = await Promise.all([
        firstValueFrom(this.venuesApi.list({ includeInactive: true })),
        firstValueFrom(
          this.usersApi.list({
            page,
            ...(search ? { search } : {}),
            ...(role ? { role: role as UserRole } : {}),
          }),
        ),
      ]);

      this.venues.set(venuesResponse.data);
      this.users.set(usersResponse.data);
      this.meta.set(usersResponse.meta);
    } catch {
      this.error.set('We could not load users.');
      this.venues.set([]);
      this.users.set([]);
      this.meta.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  toggleVenueSelection(venueId: number, checked: boolean): void {
    this.selectedVenueIds.update((currentSelection) => {
      if (checked) {
        return currentSelection.includes(venueId)
          ? currentSelection
          : [...currentSelection, venueId];
      }

      return currentSelection.filter((currentVenueId) => currentVenueId !== venueId);
    });
  }

  async submit(): Promise<void> {
    this.error.set(null);

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    if (
      this.createForm.controls.password.getRawValue() !==
      this.createForm.controls.passwordConfirmation.getRawValue()
    ) {
      this.error.set('Password and confirmation must match.');
      return;
    }

    if (this.isStaffRole() && this.selectedVenueIds().length === 0) {
      this.error.set('Please select at least one venue for the staff user.');
      return;
    }

    this.saving.set(true);

    try {
      await firstValueFrom(
        this.usersApi.create({
          name: this.createForm.controls.name.getRawValue(),
          email: this.createForm.controls.email.getRawValue(),
          password: this.createForm.controls.password.getRawValue(),
          password_confirmation: this.createForm.controls.passwordConfirmation.getRawValue(),
          role: this.createForm.controls.role.getRawValue() as UserRole,
          ...(this.isStaffRole() ? { venue_ids: this.selectedVenueIds() } : {}),
        }),
      );

      this.notifications.show({
        tone: 'success',
        title: 'User created successfully.',
      });

      this.createForm.reset({
        name: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        role: 'customer',
      });
      this.selectedVenueIds.set([]);
      await this.loadDependencies();
    } catch (error: unknown) {
      this.error.set(getApiErrorMessage(error, 'The user could not be created.'));
    } finally {
      this.saving.set(false);
    }
  }

  async applyFilters(): Promise<void> {
    await this.loadDependencies(1);
  }

  async goToPage(page: number): Promise<void> {
    const meta = this.meta();

    if (!meta || page < 1 || page > meta.last_page) {
      return;
    }

    await this.loadDependencies(page);
  }

  roleLabel(role: User['role']): string {
    return USER_ROLE_LABELS[role];
  }

  toneForRole = roleTone;
}
