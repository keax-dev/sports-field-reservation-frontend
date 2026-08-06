import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { SPORT_TYPE_LABELS } from '../../../../shared/constants/options';
import { activeTone } from '../../../../shared/utils/domain-presenters';
import { VenuesApi } from '../../data-access/venues-api';
import type { Venue } from '../../../../shared/types/domain.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-venue-detail-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
  ],
  templateUrl: './venue-detail-page.html',
  styleUrl: './venue-detail-page.css',
})
export class VenueDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly venuesApi = inject(VenuesApi);

  readonly venue = signal<Venue | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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

  sportTypeLabel = (sportType: keyof typeof SPORT_TYPE_LABELS) => SPORT_TYPE_LABELS[sportType];
  toneForActive = activeTone;
}
