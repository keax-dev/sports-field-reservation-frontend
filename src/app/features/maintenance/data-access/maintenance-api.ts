import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { ApiResponse, PaginatedResponse } from '../../../shared/types/api.types';
import type {
  CreateMaintenanceBlockPayload,
  MaintenanceBlock,
} from '../../../shared/types/domain.types';
import { buildHttpParams } from '../../../shared/utils/http-params';

@Service()
export class MaintenanceApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listByField(sportsFieldId: number, page = 1): Observable<PaginatedResponse<MaintenanceBlock>> {
    return this.http.get<PaginatedResponse<MaintenanceBlock>>(
      `${this.apiBaseUrl}/sports-fields/${sportsFieldId}/maintenance-blocks`,
      {
        params: buildHttpParams({ page }),
      },
    );
  }

  create(
    sportsFieldId: number,
    payload: CreateMaintenanceBlockPayload,
  ): Observable<MaintenanceBlock> {
    return this.http
      .post<ApiResponse<MaintenanceBlock>>(
        `${this.apiBaseUrl}/sports-fields/${sportsFieldId}/maintenance-blocks`,
        payload,
      )
      .pipe(map((response) => response.data));
  }

  delete(maintenanceBlockId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/maintenance-blocks/${maintenanceBlockId}`);
  }
}
