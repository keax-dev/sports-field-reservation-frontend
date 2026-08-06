import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { ApiMessageResponse } from '../../../shared/types/api.types';
import type { StaffAssignment, StaffAssignmentPayload } from '../../../shared/types/domain.types';

interface StaffAssignmentUpdateResponse {
  user_id: number;
  venue_ids: number[];
}

@Service()
export class StaffAssignmentsApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Observable<StaffAssignment[]> {
    return this.http
      .get<{ data: StaffAssignment[] }>(`${this.apiBaseUrl}/staff-assignments`)
      .pipe(map((response) => response.data));
  }

  saveAssignments(payload: StaffAssignmentPayload): Observable<StaffAssignmentUpdateResponse> {
    return this.http
      .post<ApiMessageResponse<StaffAssignmentUpdateResponse>>(
        `${this.apiBaseUrl}/staff-assignments`,
        payload,
      )
      .pipe(map((response) => response.data));
  }
}
