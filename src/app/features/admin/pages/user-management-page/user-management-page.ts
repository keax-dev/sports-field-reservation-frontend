import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { UserManagementFacade } from '../../application/user-management.facade';

@Component({
  selector: 'app-user-management-page',
  providers: [UserManagementFacade],
  imports: [
    ReactiveFormsModule,
    PageHeader,
    StatusBadge,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmNativeSelectImports,
  ],
  templateUrl: './user-management-page.html',
  styleUrl: './user-management-page.css',
})
export class UserManagementPage {
  readonly facade = inject(UserManagementFacade);
  readonly users = this.facade.users;
  readonly venues = this.facade.venues;
  readonly meta = this.facade.meta;
  readonly loading = this.facade.loading;
  readonly saving = this.facade.saving;
  readonly error = this.facade.error;
  readonly selectedVenueIds = this.facade.selectedVenueIds;
  readonly roleOptions = this.facade.roleOptions;
  readonly toneForRole = this.facade.toneForRole;
  readonly isStaffRole = this.facade.isStaffRole;
  readonly filterForm = this.facade.filterForm;
  readonly createForm = this.facade.createForm;
  readonly toggleVenueSelection = this.facade.toggleVenueSelection.bind(this.facade);
  readonly submit = this.facade.submit.bind(this.facade);
  readonly applyFilters = this.facade.applyFilters.bind(this.facade);
  readonly goToPage = this.facade.goToPage.bind(this.facade);
  readonly roleLabel = this.facade.roleLabel.bind(this.facade);
}
