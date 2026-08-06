import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import type { UserRole } from '../../shared/types/domain.types';
import { AuthSession } from '../auth/auth-session';

export const roleGuard: CanActivateFn = (route, state) => {
  const authSession = inject(AuthSession);
  const router = inject(Router);
  const roles = (route.data?.['roles'] as readonly UserRole[] | undefined) ?? [];

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirect: state.url },
    });
  }

  if (roles.length === 0 || authSession.hasRole(roles)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
