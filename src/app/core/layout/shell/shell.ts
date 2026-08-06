import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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

  readonly authSession = inject(AuthSession);
  readonly notifications = inject(NotificationStore);
  readonly isLoggingOut = signal(false);

  readonly userLabel = computed(() => {
    const user = this.authSession.user();

    return user ? `${user.name} · ${user.role}` : null;
  });

  async logout(): Promise<void> {
    this.isLoggingOut.set(true);

    try {
      await firstValueFrom(this.authApi.logout());
    } catch {
      // no-op: the local session still needs to be cleared.
    } finally {
      this.authSession.clear();
      this.notifications.show({
        tone: 'info',
        title: 'Signed out successfully.',
      });
      this.isLoggingOut.set(false);
      await this.router.navigate(['/']);
    }
  }
}
