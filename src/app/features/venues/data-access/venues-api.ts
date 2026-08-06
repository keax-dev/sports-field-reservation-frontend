import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { ApiResponse, PaginatedResponse } from '../../../shared/types/api.types';
import type { CreateVenuePayload, Venue, VenueFilters } from '../../../shared/types/domain.types';
import { buildHttpParams } from '../../../shared/utils/http-params';

@Service()
export class VenuesApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(filters: VenueFilters = {}): Observable<PaginatedResponse<Venue>> {
    return this.http.get<PaginatedResponse<Venue>>(`${this.apiBaseUrl}/venues`, {
      params: buildHttpParams({
        page: filters.page,
        city: filters.city,
        include_inactive: filters.includeInactive,
        include_fields: filters.includeFields,
      }),
    });
  }

  get(venueId: number): Observable<Venue> {
    return this.http
      .get<ApiResponse<Venue>>(`${this.apiBaseUrl}/venues/${venueId}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateVenuePayload): Observable<Venue> {
    return this.http
      .post<ApiResponse<Venue>>(`${this.apiBaseUrl}/venues`, payload)
      .pipe(map((response) => response.data));
  }

  update(venueId: number, payload: CreateVenuePayload): Observable<Venue> {
    return this.http
      .put<ApiResponse<Venue>>(`${this.apiBaseUrl}/venues/${venueId}`, payload)
      .pipe(map((response) => response.data));
  }
}
