import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { SportsFieldManagementFacade } from '../../application/sports-field-management.facade';

@Component({
  selector: 'app-sports-field-management-page',
  providers: [SportsFieldManagementFacade],
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
    ...HlmTextareaImports,
  ],
  templateUrl: './sports-field-management-page.html',
  styleUrl: './sports-field-management-page.css',
})
export class SportsFieldManagementPage {
  readonly facade = inject(SportsFieldManagementFacade);
  readonly sportsFields = this.facade.sportsFields;
  readonly venues = this.facade.venues;
  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly error = this.facade.error;
  readonly editingSportsFieldId = this.facade.editingSportsFieldId;
  readonly sportTypeOptions = this.facade.sportTypeOptions;
  readonly toneForActive = this.facade.toneForActive;
  readonly sportTypeLabel = this.facade.sportTypeLabel;
  readonly form = this.facade.form;
  readonly editSportsField = this.facade.editSportsField.bind(this.facade);
  readonly resetForm = this.facade.resetForm.bind(this.facade);
  readonly submit = this.facade.submit.bind(this.facade);
}
