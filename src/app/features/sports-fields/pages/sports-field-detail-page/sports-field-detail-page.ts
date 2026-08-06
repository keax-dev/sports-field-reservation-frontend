import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { SportsFieldDetailFacade } from '../../application/sports-field-detail.facade';

@Component({
  selector: 'app-sports-field-detail-page',
  providers: [SportsFieldDetailFacade],
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
  ],
  templateUrl: './sports-field-detail-page.html',
  styleUrl: './sports-field-detail-page.css',
})
export class SportsFieldDetailPage {
  readonly facade = inject(SportsFieldDetailFacade);
  readonly authSession = this.facade.authSession;
  readonly sportsField = this.facade.sportsField;
  readonly availability = this.facade.availability;
  readonly loading = this.facade.loading;
  readonly availabilityLoading = this.facade.availabilityLoading;
  readonly error = this.facade.error;
  readonly availabilityError = this.facade.availabilityError;
  readonly toneForActive = this.facade.toneForActive;
  readonly sportTypeLabel = this.facade.sportTypeLabel;
  readonly searchForm = this.facade.searchForm;
  readonly durationOptions = this.facade.durationOptions;
  readonly searchAvailability = this.facade.searchAvailability.bind(this.facade);
  readonly goToReservation = this.facade.goToReservation.bind(this.facade);
}
