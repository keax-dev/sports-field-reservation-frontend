import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { NotificationStore } from '../../../../core/notifications/notification-store';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import type { StaffAssignment, User, Venue } from '../../../../shared/types/domain.types';
import { getApiErrorMessage } from '../../../../shared/utils/http-error.utils';
import { StaffAssignmentsApi } from '../../data-access/staff-assignments-api';
import { UsersApi } from '../../data-access/users-api';
import { VenuesApi } from '../../../venues/data-access/venues-api';

interface GroupedAssignment {
  user: Pick<User, 'id' | 'name' | 'email'>;
  venues: Pick<Venue, 'id' | 'name' | 'city'>[];
}

@Component({
  selector: 'app-staff-assignment-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmNativeSelectImports,
  ],
  templateUrl: './staff-assignment-page.html',
  styleUrl: './staff-assignment-page.css',
})
export class StaffAssignmentPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly staffAssignmentsApi = inject(StaffAssignmentsApi);
  private readonly usersApi = inject(UsersApi);
  private readonly venuesApi = inject(VenuesApi);
  private readonly notifications = inject(NotificationStore);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly assignments = signal<StaffAssignment[]>([]);
  readonly staffUsers = signal<User[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly selectedVenueIds = signal<number[]>([]);

  readonly form = this.formBuilder.nonNullable.group({
    userId: ['', [Validators.required]],
  });

  readonly groupedAssignments = computed(() => {
    const grouped = new Map<number, GroupedAssignment>();

    for (const assignment of this.assignments()) {
      const existingAssignment = grouped.get(assignment.user.id);

      if (existingAssignment) {
        existingAssignment.venues.push(assignment.venue);
        continue;
      }

      grouped.set(assignment.user.id, {
        user: assignment.user,
        venues: [assignment.venue],
      });
    }

    return [...grouped.values()];
  });

  constructor() {
    this.form.controls.userId.valueChanges.pipe(takeUntilDestroyed()).subscribe((userId) => {
      this.syncSelection(userId);
    });

    void this.loadDependencies();
  }

  async loadDependencies(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [assignmentsResponse, usersResponse, venuesResponse] = await Promise.all([
        firstValueFrom(this.staffAssignmentsApi.list()),
        firstValueFrom(this.usersApi.list({ role: 'staff' })),
        firstValueFrom(this.venuesApi.list({ includeInactive: true })),
      ]);

      this.assignments.set(assignmentsResponse);
      this.staffUsers.set(usersResponse.data);
      this.venues.set(venuesResponse.data);
      this.syncSelection(this.form.controls.userId.getRawValue());
    } catch {
      this.error.set('We could not load staff assignments.');
      this.assignments.set([]);
      this.staffUsers.set([]);
      this.venues.set([]);
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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      await firstValueFrom(
        this.staffAssignmentsApi.saveAssignments({
          user_id: Number(this.form.controls.userId.getRawValue()),
          venue_ids: this.selectedVenueIds(),
        }),
      );

      this.notifications.show({
        tone: 'success',
        title: 'Staff assignments updated successfully.',
      });
      await this.loadDependencies();
    } catch (error: unknown) {
      this.error.set(getApiErrorMessage(error, 'Staff assignments could not be updated.'));
    } finally {
      this.saving.set(false);
    }
  }

  private syncSelection(userId: string): void {
    if (!userId) {
      this.selectedVenueIds.set([]);
      return;
    }

    const selectedUserId = Number(userId);
    const currentVenueIds = this.assignments()
      .filter((assignment) => assignment.user.id === selectedUserId)
      .map((assignment) => assignment.venue.id);

    this.selectedVenueIds.set(currentVenueIds);
  }
}
