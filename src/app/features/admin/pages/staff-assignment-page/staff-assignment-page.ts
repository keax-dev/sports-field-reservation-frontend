import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StaffAssignmentFacade } from '../../application/staff-assignment.facade';

@Component({
  selector: 'app-staff-assignment-page',
  providers: [StaffAssignmentFacade],
  imports: [
    ReactiveFormsModule,
    PageHeader,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmNativeSelectImports,
  ],
  templateUrl: './staff-assignment-page.html',
  styleUrl: './staff-assignment-page.css',
})
export class StaffAssignmentPage {
  readonly facade = inject(StaffAssignmentFacade);
  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly error = this.facade.error;
  readonly assignments = this.facade.assignments;
  readonly staffUsers = this.facade.staffUsers;
  readonly venues = this.facade.venues;
  readonly selectedVenueIds = this.facade.selectedVenueIds;
  readonly form = this.facade.form;
  readonly groupedAssignments = this.facade.groupedAssignments;
  readonly toggleVenueSelection = this.facade.toggleVenueSelection.bind(this.facade);
  readonly submit = this.facade.submit.bind(this.facade);
}
