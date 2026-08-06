import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { MaintenanceBlockFacade } from '../../application/maintenance-block.facade';

@Component({
  selector: 'app-maintenance-block-page',
  providers: [MaintenanceBlockFacade],
  imports: [
    ReactiveFormsModule,
    DatePipe,
    PageHeader,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
    ...HlmTextareaImports,
  ],
  templateUrl: './maintenance-block-page.html',
  styleUrl: './maintenance-block-page.css',
})
export class MaintenanceBlockPage {
  readonly facade = inject(MaintenanceBlockFacade);
  readonly sportsFields = this.facade.sportsFields;
  readonly maintenanceBlocks = this.facade.maintenanceBlocks;
  readonly meta = this.facade.meta;
  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly deletingId = this.facade.deletingId;
  readonly error = this.facade.error;
  readonly form = this.facade.form;
  readonly submit = this.facade.submit.bind(this.facade);
  readonly deleteBlock = this.facade.deleteBlock.bind(this.facade);
  readonly goToPage = this.facade.goToPage.bind(this.facade);
}
