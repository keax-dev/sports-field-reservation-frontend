import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { NotificationStore } from '../../../core/notifications/notification-store';
import type { StaffAssignment, User, Venue } from '../../../shared/types/domain.types';
import { getApiErrorMessage } from '../../../shared/utils/http-error.utils';
import { StaffAssignmentsApi } from '../data-access/staff-assignments-api';
import { UsersApi } from '../data-access/users-api';
import { VenuesApi } from '../../venues/data-access/venues-api';

interface GroupedAssignment {
  user: Pick<User, 'id' | 'name' | 'email'>;
  venues: Pick<Venue, 'id' | 'name' | 'city'>[];
}

@Service({ autoProvided: false })
export class StaffAssignmentFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly staffAssignmentsApi = inject(StaffAssignmentsApi);
  private readonly usersApi = inject(UsersApi);
  private readonly venuesApi = inject(VenuesApi);
  private readonly notifications = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

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

    this.loadDependencies();
  }

  loadDependencies(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      assignmentsResponse: this.staffAssignmentsApi.list(),
      usersResponse: this.usersApi.list({ role: 'staff' }),
      venuesResponse: this.venuesApi.list({ includeInactive: true }),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: ({ assignmentsResponse, usersResponse, venuesResponse }) => {
          this.assignments.set(assignmentsResponse);
          this.staffUsers.set(usersResponse.data);
          this.venues.set(venuesResponse.data);
          this.syncSelection(this.form.controls.userId.getRawValue());
        },
        error: () => {
          this.error.set('We could not load staff assignments.');
          this.assignments.set([]);
          this.staffUsers.set([]);
          this.venues.set([]);
        },
      });
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

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.staffAssignmentsApi
      .saveAssignments({
        user_id: Number(this.form.controls.userId.getRawValue()),
        venue_ids: this.selectedVenueIds(),
      })
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
            title: 'Staff assignments updated successfully.',
          });
          this.loadDependencies();
        },
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error, 'Staff assignments could not be updated.'));
        },
      });
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
