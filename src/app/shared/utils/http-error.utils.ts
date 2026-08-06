import { HttpErrorResponse } from '@angular/common/http';
import type { LaravelValidationErrorResponse } from '../types/api.types';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body: unknown = error.error;

  if (typeof body === 'string' && body.trim().length > 0) {
    return body;
  }

  if (
    isValidationBody(body) &&
    typeof body.message === 'string' &&
    body.message.trim().length > 0
  ) {
    return body.message;
  }

  if (hasMessage(body)) {
    return body.message;
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

export function getValidationErrors(error: unknown): Record<string, string> {
  if (
    !(error instanceof HttpErrorResponse) ||
    !isValidationBody(error.error) ||
    !error.error.errors
  ) {
    return {};
  }

  return Object.entries(error.error.errors).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      const firstMessage = value[0];

      if (firstMessage) {
        accumulator[key] = firstMessage;
      }

      return accumulator;
    },
    {},
  );
}

function isValidationBody(value: unknown): value is LaravelValidationErrorResponse {
  return !!value && typeof value === 'object' && 'message' in value;
}

function hasMessage(value: unknown): value is { message: string } {
  return (
    !!value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
  );
}
