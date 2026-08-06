import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { ApiResponse } from '../../../shared/types/api.types';
import type {
  AuthSessionPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '../../../shared/types/domain.types';

interface AuthResponse extends ApiResponse<User> {
  meta: {
    token_name: string;
    access_token: string;
  };
}

@Service()
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  login(payload: LoginPayload): Observable<AuthSessionPayload> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, payload)
      .pipe(map((response) => this.toSessionPayload(response)));
  }

  register(payload: RegisterPayload): Observable<AuthSessionPayload> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/register`, payload)
      .pipe(map((response) => this.toSessionPayload(response)));
  }

  me(): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiBaseUrl}/auth/me`)
      .pipe(map((response) => response.data));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/auth/logout`, {});
  }

  private toSessionPayload(response: AuthResponse): AuthSessionPayload {
    return {
      user: response.data,
      accessToken: response.meta.access_token,
      tokenName: response.meta.token_name,
    };
  }
}
