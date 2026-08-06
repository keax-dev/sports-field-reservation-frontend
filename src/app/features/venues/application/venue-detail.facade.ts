import { effect, inject, Service, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { SPORT_TYPE_LABELS } from '../../../shared/constants/options';
import type { Venue } from '../../../shared/types/domain.types';
import { activeTone } from '../../../shared/utils/domain-presenters';
import { VenuesApi } from '../data-access/venues-api';

@Service({ autoProvided: false })
export class VenueDetailFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly venuesApi = inject(VenuesApi);

  readonly venue = signal<Venue | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly toneForActive = activeTone;
  readonly sportTypeLabel = (sportType: keyof typeof SPORT_TYPE_LABELS) =>
    SPORT_TYPE_LABELS[sportType];

  private readonly venueId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('venueId')))),
    {
      initialValue: Number(this.route.snapshot.paramMap.get('venueId')),
    },
  );

  constructor() {
    effect(() => {
      const venueId = this.venueId();

      if (Number.isFinite(venueId) && venueId > 0) {
        void this.loadVenue(venueId);
      }
    });
  }

  async loadVenue(venueId: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const venue = await firstValueFrom(this.venuesApi.get(venueId));
      this.venue.set(venue);
    } catch {
      this.error.set('We could not load this venue.');
      this.venue.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
