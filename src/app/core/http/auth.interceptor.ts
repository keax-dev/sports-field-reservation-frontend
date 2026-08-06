import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthSession } from '../auth/auth-session';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSession);
  const accessToken = authSession.accessToken();

  const authorizedRequest = request.clone({
    setHeaders: {
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (typeof error === 'object' && error && 'status' in error && error.status === 401) {
        authSession.clear();
      }

      return throwError(() => error);
    }),
  );
};
