import { Service, computed, signal } from '@angular/core';
import type { AuthSessionPayload, User, UserRole } from '../../shared/types/domain.types';

const SESSION_STORAGE_KEY = 'sports-field-reservation.session';

interface PersistedSession {
  accessToken: string;
  tokenName: string;
  user: User;
}

@Service()
export class AuthSession {
  private readonly currentUser = signal<User | null>(null);
  private readonly currentAccessToken = signal<string | null>(null);
  private readonly currentTokenName = signal<string | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly accessToken = this.currentAccessToken.asReadonly();
  readonly tokenName = this.currentTokenName.asReadonly();

  readonly role = computed(() => this.currentUser()?.role ?? null);
  readonly isAuthenticated = computed(
    () => this.currentUser() !== null && this.currentAccessToken() !== null,
  );
  readonly isCustomer = computed(() => this.role() === 'customer');
  readonly isStaff = computed(() => this.role() === 'staff');
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isBackoffice = computed(() => this.isStaff() || this.isAdmin());

  constructor() {
    this.restore();
  }

  setSession(payload: AuthSessionPayload): void {
    this.currentUser.set(payload.user);
    this.currentAccessToken.set(payload.accessToken);
    this.currentTokenName.set(payload.tokenName);
    this.persist();
  }

  updateUser(user: User): void {
    this.currentUser.set(user);
    this.persist();
  }

  hasRole(roles: readonly UserRole[]): boolean {
    const role = this.role();

    return role !== null && roles.includes(role);
  }

  clear(): void {
    this.currentUser.set(null);
    this.currentAccessToken.set(null);
    this.currentTokenName.set(null);

    if ('localStorage' in globalThis) {
      globalThis.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  private persist(): void {
    if (!('localStorage' in globalThis) || !this.isAuthenticated()) {
      return;
    }

    const accessToken = this.currentAccessToken();
    const tokenName = this.currentTokenName();
    const user = this.currentUser();

    if (!accessToken || !tokenName || !user) {
      return;
    }

    const payload: PersistedSession = {
      accessToken,
      tokenName,
      user,
    };

    globalThis.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }

  private restore(): void {
    if (!('localStorage' in globalThis)) {
      return;
    }

    const rawSession = globalThis.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) {
      return;
    }

    try {
      const session = JSON.parse(rawSession) as PersistedSession;

      if (!session.accessToken || !session.tokenName || !session.user) {
        this.clear();
        return;
      }

      this.currentAccessToken.set(session.accessToken);
      this.currentTokenName.set(session.tokenName);
      this.currentUser.set(session.user);
    } catch {
      this.clear();
    }
  }
}
