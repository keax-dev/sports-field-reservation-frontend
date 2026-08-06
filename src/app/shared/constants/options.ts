import type {
  PaymentMethod,
  PaymentStatus,
  ReservationStatus,
  SportType,
  UserRole,
} from '../types/domain.types';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export const USER_ROLE_OPTIONS: readonly SelectOption<UserRole>[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
];

export const SPORT_TYPE_OPTIONS: readonly SelectOption<SportType>[] = [
  { value: 'football', label: 'Football' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'multi_sport', label: 'Multi sport' },
];

export const PAYMENT_METHOD_OPTIONS: readonly SelectOption<PaymentMethod>[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Transfer' },
];

export const RESERVATION_STATUS_OPTIONS: readonly SelectOption<ReservationStatus>[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending payment',
  paid: 'Paid',
  waived: 'Waived',
  refunded: 'Refunded',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  staff: 'Staff',
  admin: 'Admin',
};

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  football: 'Football',
  tennis: 'Tennis',
  padel: 'Padel',
  basketball: 'Basketball',
  volleyball: 'Volleyball',
  multi_sport: 'Multi sport',
};
