import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('api-base-url', {
  factory: () => 'http://127.0.0.1:8000/api/v1',
});
