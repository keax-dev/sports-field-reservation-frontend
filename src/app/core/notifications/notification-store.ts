import { Service, signal } from '@angular/core';

export type NotificationTone = 'success' | 'error' | 'info';

export interface NotificationMessage {
  tone: NotificationTone;
  title: string;
  description?: string;
}

@Service()
export class NotificationStore {
  private timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
  private readonly currentMessage = signal<NotificationMessage | null>(null);

  readonly current = this.currentMessage.asReadonly();

  show(message: NotificationMessage, autoClearAfterMs = 5000): void {
    this.clearTimer();
    this.currentMessage.set(message);

    if (autoClearAfterMs > 0) {
      this.timeoutId = globalThis.setTimeout(() => {
        this.currentMessage.set(null);
        this.timeoutId = null;
      }, autoClearAfterMs);
    }
  }

  clear(): void {
    this.clearTimer();
    this.currentMessage.set(null);
  }

  private clearTimer(): void {
    if (this.timeoutId !== null) {
      globalThis.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
