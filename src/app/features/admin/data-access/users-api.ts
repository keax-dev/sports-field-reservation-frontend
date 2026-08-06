import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { ApiResponse, PaginatedResponse } from '../../../shared/types/api.types';
import type { CreateUserPayload, User, UserFilters } from '../../../shared/types/domain.types';
import { buildHttpParams } from '../../../shared/utils/http-params';

@Service()
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(filters: UserFilters = {}): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.apiBaseUrl}/users`, {
      params: buildHttpParams({
        page: filters.page,
        role: filters.role,
        search: filters.search,
      }),
    });
  }

  create(payload: CreateUserPayload): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.apiBaseUrl}/users`, payload)
      .pipe(map((response) => response.data));
  }
}
