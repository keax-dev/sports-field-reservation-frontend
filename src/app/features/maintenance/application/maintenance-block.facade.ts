import { effect, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { BrowserConfirmationService } from '../../../core/browser/browser-confirmation.service';
import { NotificationStore } from '../../../core/notifications/notification-store';
import type { PaginationMeta } from '../../../shared/types/api.types';
import type { MaintenanceBlock, SportsField } from '../../../shared/types/domain.types';
import { toApiDateTime } from '../../../shared/utils/date-time.utils';
import { getApiErrorMessage } from '../../../shared/utils/http-error.utils';
import { SportsFieldsApi } from '../../sports-fields/data-access/sports-fields-api';
import { MaintenanceApi } from '../data-access/maintenance-api';

@Service({ autoProvided: false })
export class MaintenanceBlockFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sportsFieldsApi = inject(SportsFieldsApi);
  private readonly maintenanceApi = inject(MaintenanceApi);
  private readonly notifications = inject(NotificationStore);
  private readonly confirmation = inject(BrowserConfirmationService);

  readonly sportsFields = signal<SportsField[]>([]);
  readonly maintenanceBlocks = signal<MaintenanceBlock[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    sportsFieldId: [''],
    startsAt: ['', [Validators.required]],
    endsAt: ['', [Validators.required]],
    reason: ['', [Validators.required]],
  });

  private readonly querySportsFieldId = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('sportsFieldId'))),
    {
      initialValue: this.route.snapshot.queryParamMap.get('sportsFieldId'),
    },
  );

  constructor() {
    this.form.controls.sportsFieldId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((sportsFieldId) => {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { sportsFieldId: sportsFieldId || null },
          queryParamsHandling: 'merge',
        });

        if (sportsFieldId) {
          void this.loadMaintenanceBlocks(1, Number(sportsFieldId));
        } else {
          this.maintenanceBlocks.set([]);
          this.meta.set(null);
        }
      });

    effect(() => {
      const sportsFieldId = this.querySportsFieldId();

      if (sportsFieldId) {
        this.form.controls.sportsFieldId.setValue(sportsFieldId, { emitEvent: false });
      }
    });

    void this.loadSportsFields();
  }

  async loadSportsFields(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.sportsFieldsApi.list({ includeInactive: true }));
      this.sportsFields.set(response.data);

      const selectedSportsFieldId = this.form.controls.sportsFieldId.getRawValue();

      if (selectedSportsFieldId) {
        await this.loadMaintenanceBlocks(1, Number(selectedSportsFieldId));
      }
    } catch {
      this.error.set('We could not load sports fields.');
      this.sportsFields.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMaintenanceBlocks(
    page = 1,
    sportsFieldId = Number(this.form.controls.sportsFieldId.getRawValue()),
  ): Promise<void> {
    if (!sportsFieldId) {
      this.maintenanceBlocks.set([]);
      this.meta.set(null);
      return;
    }

    this.error.set(null);

    try {
      const response = await firstValueFrom(this.maintenanceApi.listByField(sportsFieldId, page));
      this.maintenanceBlocks.set(response.data);
      this.meta.set(response.meta);
    } catch (error: unknown) {
      this.error.set(getApiErrorMessage(error, 'Maintenance blocks could not be loaded.'));
      this.maintenanceBlocks.set([]);
      this.meta.set(null);
    }
  }

  async submit(): Promise<void> {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const sportsFieldId = Number(this.form.controls.sportsFieldId.getRawValue());

    if (!sportsFieldId) {
      this.error.set('Please select a sports field.');
      return;
    }

    this.saving.set(true);

    try {
      await firstValueFrom(
        this.maintenanceApi.create(sportsFieldId, {
          starts_at: toApiDateTime(this.form.controls.startsAt.getRawValue()),
          ends_at: toApiDateTime(this.form.controls.endsAt.getRawValue()),
          reason: this.form.controls.reason.getRawValue(),
        }),
      );

      this.notifications.show({
        tone: 'success',
        title: 'Maintenance block created successfully.',
      });

      this.form.patchValue({
        startsAt: '',
        endsAt: '',
        reason: '',
      });
      await this.loadMaintenanceBlocks();
    } catch (error: unknown) {
      this.error.set(getApiErrorMessage(error, 'The maintenance block could not be created.'));
    } finally {
      this.saving.set(false);
    }
  }

  async deleteBlock(block: MaintenanceBlock): Promise<void> {
    const confirmed = this.confirmation.confirm(
      `Delete maintenance block from ${new Date(block.starts_at).toLocaleString()} to ${new Date(block.ends_at).toLocaleString()}?`,
    );

    if (!confirmed) {
      return;
    }

    this.deletingId.set(block.id);
    this.error.set(null);

    try {
      await firstValueFrom(this.maintenanceApi.delete(block.id));
      this.notifications.show({
        tone: 'success',
        title: 'Maintenance block deleted successfully.',
      });
      await this.loadMaintenanceBlocks();
    } catch (error: unknown) {
      this.error.set(getApiErrorMessage(error, 'The maintenance block could not be deleted.'));
    } finally {
      this.deletingId.set(null);
    }
  }

  async goToPage(page: number): Promise<void> {
    const meta = this.meta();

    if (!meta || page < 1 || page > meta.last_page) {
      return;
    }

    await this.loadMaintenanceBlocks(page);
  }
}
