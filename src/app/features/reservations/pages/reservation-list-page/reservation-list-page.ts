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
import { ReservationListFacade } from '../../application/reservation-list.facade';

@Component({
  selector: 'app-reservation-list-page',
  providers: [ReservationListFacade],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
  ],
  templateUrl: './reservation-list-page.html',
  styleUrl: './reservation-list-page.css',
})
export class ReservationListPage {
  readonly facade = inject(ReservationListFacade);
  readonly reservations = this.facade.reservations;
  readonly meta = this.facade.meta;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly filtersForm = this.facade.filtersForm;
  readonly statusOptions = this.facade.statusOptions;
  readonly reservationTone = this.facade.reservationTone;
  readonly paymentTone = this.facade.paymentTone;
  readonly loadReservations = this.facade.loadReservations.bind(this.facade);
  readonly applyFilters = this.facade.applyFilters.bind(this.facade);
  readonly goToPage = this.facade.goToPage.bind(this.facade);
  readonly reservationStatusLabel = this.facade.reservationStatusLabel.bind(this.facade);
  readonly paymentStatusLabel = this.facade.paymentStatusLabel.bind(this.facade);
  readonly venueLabel = this.facade.venueLabel.bind(this.facade);
}
