import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { ApiResponse, PaginatedResponse } from '../../../shared/types/api.types';
import type {
  AvailabilitySlot,
  CreateSportsFieldPayload,
  SportsField,
  SportsFieldFilters,
} from '../../../shared/types/domain.types';
import { buildHttpParams } from '../../../shared/utils/http-params';

@Service()
export class SportsFieldsApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(filters: SportsFieldFilters = {}): Observable<PaginatedResponse<SportsField>> {
    return this.http.get<PaginatedResponse<SportsField>>(`${this.apiBaseUrl}/sports-fields`, {
      params: buildHttpParams({
        page: filters.page,
        venue_id: filters.venueId,
        sport_type: filters.sportType,
        include_inactive: filters.includeInactive,
      }),
    });
  }

  get(sportsFieldId: number): Observable<SportsField> {
    return this.http
      .get<ApiResponse<SportsField>>(`${this.apiBaseUrl}/sports-fields/${sportsFieldId}`)
      .pipe(map((response) => response.data));
  }

  getAvailability(
    sportsFieldId: number,
    params: { date: string; durationMinutes?: number },
  ): Observable<AvailabilitySlot[]> {
    return this.http
      .get<ApiResponse<AvailabilitySlot[]>>(
        `${this.apiBaseUrl}/sports-fields/${sportsFieldId}/availability`,
        {
          params: buildHttpParams({
            date: params.date,
            duration_minutes: params.durationMinutes,
          }),
        },
      )
      .pipe(map((response) => response.data));
  }

  create(payload: CreateSportsFieldPayload): Observable<SportsField> {
    return this.http
      .post<ApiResponse<SportsField>>(`${this.apiBaseUrl}/sports-fields`, payload)
      .pipe(map((response) => response.data));
  }

  update(sportsFieldId: number, payload: CreateSportsFieldPayload): Observable<SportsField> {
    return this.http
      .put<ApiResponse<SportsField>>(`${this.apiBaseUrl}/sports-fields/${sportsFieldId}`, payload)
      .pipe(map((response) => response.data));
  }
}
