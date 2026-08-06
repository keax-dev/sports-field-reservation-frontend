import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { HomeFacade } from '../../application/home.facade';

@Component({
  selector: 'app-home-page',
  providers: [HomeFacade],
  imports: [
    RouterLink,
    CurrencyPipe,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  readonly facade = inject(HomeFacade);
  readonly authSession = this.facade.authSession;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly venues = this.facade.venues;
  readonly sportsFields = this.facade.sportsFields;
  readonly activeVenues = this.facade.activeVenues;
  readonly activeFields = this.facade.activeFields;
  readonly demoAccounts = this.facade.demoAccounts;
  readonly venueStatusTone = this.facade.venueStatusTone;
  readonly sportTypeLabel = this.facade.sportTypeLabel.bind(this.facade);
  readonly trackByVenue = this.facade.trackByVenue.bind(this.facade);
  readonly trackBySportsField = this.facade.trackBySportsField.bind(this.facade);
}
