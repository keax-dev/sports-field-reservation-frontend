import { Service } from '@angular/core';

@Service()
export class BrowserConfirmationService {
  confirm(message: string): boolean {
    return globalThis.confirm(message);
  }
}
