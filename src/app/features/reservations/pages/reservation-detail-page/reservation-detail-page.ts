import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ReservationDetailFacade } from '../../application/reservation-detail.facade';

@Component({
  selector: 'app-reservation-detail-page',
  providers: [ReservationDetailFacade],
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
    ...HlmTextareaImports,
  ],
  templateUrl: './reservation-detail-page.html',
  styleUrl: './reservation-detail-page.css',
})
export class ReservationDetailPage {
  readonly facade = inject(ReservationDetailFacade);
  readonly reservation = this.facade.reservation;
  readonly loading = this.facade.loading;
  readonly actionError = this.facade.actionError;
  readonly processingConfirm = this.facade.processingConfirm;
  readonly processingCancel = this.facade.processingCancel;
  readonly paymentMethodOptions = this.facade.paymentMethodOptions;
  readonly reservationTone = this.facade.reservationTone;
  readonly paymentTone = this.facade.paymentTone;
  readonly confirmForm = this.facade.confirmForm;
  readonly cancelForm = this.facade.cancelForm;
  readonly confirmReservation = this.facade.confirmReservation.bind(this.facade);
  readonly cancelReservation = this.facade.cancelReservation.bind(this.facade);
  readonly reservationStatusLabel = this.facade.reservationStatusLabel.bind(this.facade);
  readonly paymentStatusLabel = this.facade.paymentStatusLabel.bind(this.facade);
  readonly canConfirm = this.facade.canConfirm.bind(this.facade);
  readonly canCancel = this.facade.canCancel.bind(this.facade);
}
