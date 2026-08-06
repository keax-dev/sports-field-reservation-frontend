import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { VenueManagementFacade } from '../../application/venue-management.facade';

@Component({
  selector: 'app-venue-management-page',
  providers: [VenueManagementFacade],
  imports: [
    ReactiveFormsModule,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmTextareaImports,
  ],
  templateUrl: './venue-management-page.html',
  styleUrl: './venue-management-page.css',
})
export class VenueManagementPage {
  readonly facade = inject(VenueManagementFacade);
  readonly venues = this.facade.venues;
  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly error = this.facade.error;
  readonly editingVenueId = this.facade.editingVenueId;
  readonly toneForActive = this.facade.toneForActive;
  readonly form = this.facade.form;
  readonly editVenue = this.facade.editVenue.bind(this.facade);
  readonly resetForm = this.facade.resetForm.bind(this.facade);
  readonly submit = this.facade.submit.bind(this.facade);
}
