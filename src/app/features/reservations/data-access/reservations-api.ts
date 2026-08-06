import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { ApiResponse, PaginatedResponse } from '../../../shared/types/api.types';
import type {
  CancelReservationPayload,
  ConfirmReservationPayload,
  CreateReservationPayload,
  Reservation,
  ReservationFilters,
} from '../../../shared/types/domain.types';
import { buildHttpParams } from '../../../shared/utils/http-params';

@Service()
export class ReservationsApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(filters: ReservationFilters = {}): Observable<PaginatedResponse<Reservation>> {
    return this.http.get<PaginatedResponse<Reservation>>(`${this.apiBaseUrl}/reservations`, {
      params: buildHttpParams({
        page: filters.page,
        status: filters.status,
        customer_id: filters.customerId,
        sports_field_id: filters.sportsFieldId,
        venue_id: filters.venueId,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
      }),
    });
  }

  get(reservationId: number): Observable<Reservation> {
    return this.http
      .get<ApiResponse<Reservation>>(`${this.apiBaseUrl}/reservations/${reservationId}`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateReservationPayload): Observable<Reservation> {
    return this.http
      .post<ApiResponse<Reservation>>(`${this.apiBaseUrl}/reservations`, payload)
      .pipe(map((response) => response.data));
  }

  confirm(reservationId: number, payload: ConfirmReservationPayload): Observable<Reservation> {
    return this.http
      .patch<ApiResponse<Reservation>>(
        `${this.apiBaseUrl}/reservations/${reservationId}/confirm`,
        payload,
      )
      .pipe(map((response) => response.data));
  }

  cancel(reservationId: number, payload: CancelReservationPayload): Observable<Reservation> {
    return this.http
      .patch<ApiResponse<Reservation>>(
        `${this.apiBaseUrl}/reservations/${reservationId}/cancel`,
        payload,
      )
      .pipe(map((response) => response.data));
  }
}
