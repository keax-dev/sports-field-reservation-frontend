import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { VenueDetailFacade } from '../../application/venue-detail.facade';

@Component({
  selector: 'app-venue-detail-page',
  providers: [VenueDetailFacade],
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
  readonly facade = inject(VenueDetailFacade);
  readonly venue = this.facade.venue;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly toneForActive = this.facade.toneForActive;
  readonly sportTypeLabel = this.facade.sportTypeLabel;
}
