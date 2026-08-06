import type { PaymentStatus, ReservationStatus, UserRole } from '../types/domain.types';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export function reservationStatusTone(status: ReservationStatus): BadgeTone {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    case 'expired':
      return 'neutral';
  }
}

export function paymentStatusTone(status: PaymentStatus): BadgeTone {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'waived':
      return 'info';
    case 'refunded':
      return 'neutral';
  }
}

export function roleTone(role: UserRole): BadgeTone {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'staff':
      return 'info';
    case 'customer':
      return 'neutral';
  }
}

export function activeTone(isActive: boolean): BadgeTone {
  return isActive ? 'success' : 'neutral';
}
