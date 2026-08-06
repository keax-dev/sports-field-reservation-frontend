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
import { ReservationCreateFacade } from '../../application/reservation-create.facade';

@Component({
  selector: 'app-reservation-create-page',
  providers: [ReservationCreateFacade],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeader,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
    ...HlmTextareaImports,
  ],
  templateUrl: './reservation-create-page.html',
  styleUrl: './reservation-create-page.css',
})
export class ReservationCreatePage {
  readonly facade = inject(ReservationCreateFacade);
  readonly authSession = this.facade.authSession;
  readonly sportsFields = this.facade.sportsFields;
  readonly customers = this.facade.customers;
  readonly loading = this.facade.loading;
  readonly submitting = this.facade.submitting;
  readonly formError = this.facade.formError;
  readonly paymentMethodOptions = this.facade.paymentMethodOptions;
  readonly form = this.facade.form;
  readonly submit = this.facade.submit.bind(this.facade);
  readonly sportTypeLabel = this.facade.sportTypeLabel;
}
