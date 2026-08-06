import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthSession } from '../../auth/auth-session';
import { NotificationStore } from '../../notifications/notification-store';
import { AuthApi } from '../../../features/auth/data-access/auth-api';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ...HlmButtonImports],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly authSession = inject(AuthSession);
  readonly notifications = inject(NotificationStore);
  readonly isLoggingOut = signal(false);

  readonly userLabel = computed(() => {
    const user = this.authSession.user();

    return user ? `${user.name} · ${user.role}` : null;
  });

  logout(): void {
    this.isLoggingOut.set(true);

    this.authApi
      .logout()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null)),
        finalize(() => {
          this.authSession.clear();
          this.notifications.show({
            tone: 'info',
            title: 'Signed out successfully.',
          });
          this.isLoggingOut.set(false);
          void this.router.navigate(['/']);
        }),
      )
      .subscribe();
  }
}
