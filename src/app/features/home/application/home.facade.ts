import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from '../../../core/auth/auth-session';
import { SPORT_TYPE_LABELS } from '../../../shared/constants/options';
import type { SportsField, Venue } from '../../../shared/types/domain.types';
import { activeTone } from '../../../shared/utils/domain-presenters';
import { SportsFieldsApi } from '../../sports-fields/data-access/sports-fields-api';
import { VenuesApi } from '../../venues/data-access/venues-api';

@Service({ autoProvided: false })
export class HomeFacade {
  private readonly venuesApi = inject(VenuesApi);
  private readonly sportsFieldsApi = inject(SportsFieldsApi);

  readonly authSession = inject(AuthSession);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly venues = signal<Venue[]>([]);
  readonly sportsFields = signal<SportsField[]>([]);

  readonly activeVenues = computed(() => this.venues().filter((venue) => venue.is_active).length);
  readonly activeFields = computed(
    () => this.sportsFields().filter((sportsField) => sportsField.is_active).length,
  );

  readonly demoAccounts = [
    { role: 'Admin', email: 'admin@example.com', password: 'password' },
    { role: 'Staff', email: 'staff1@example.com', password: 'password' },
    { role: 'Customer', email: 'customer1@example.com', password: 'password' },
  ] as const;

  readonly venueStatusTone = activeTone;

  constructor() {
    void this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [venuesResponse, sportsFieldsResponse] = await Promise.all([
        firstValueFrom(this.venuesApi.list({ includeFields: true })),
        firstValueFrom(this.sportsFieldsApi.list()),
      ]);

      this.venues.set(venuesResponse.data);
      this.sportsFields.set(sportsFieldsResponse.data);
    } catch {
      this.error.set('We could not load the sports catalog right now.');
    } finally {
      this.loading.set(false);
    }
  }

  sportTypeLabel(sportType: SportsField['sport_type']): string {
    return SPORT_TYPE_LABELS[sportType];
  }

  trackByVenue(index: number, venue: Venue): number {
    return venue.id;
  }

  trackBySportsField(index: number, sportsField: SportsField): number {
    return sportsField.id;
  }
}
