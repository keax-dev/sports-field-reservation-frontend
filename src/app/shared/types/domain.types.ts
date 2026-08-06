export type UserRole = 'customer' | 'staff' | 'admin';
export type SportType =
  'football' | 'tennis' | 'padel' | 'basketball' | 'volleyball' | 'multi_sport';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'waived' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthSessionPayload {
  user: User;
  accessToken: string;
  tokenName: string;
}

export interface VenueSummary {
  id: number;
  name: string;
  city: string;
}

export type SportsFieldVenueSummary = VenueSummary;

export interface SportsFieldSummary {
  id: number;
  venue_id: number;
  name: string;
  sport_type: SportType;
}

export interface SportsField {
  id: number;
  venue_id: number;
  name: string;
  sport_type: SportType;
  description: string | null;
  hourly_rate: string;
  open_time: string;
  close_time: string;
  max_players: number | null;
  is_active: boolean;
  venue?: SportsFieldVenueSummary | null;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string | null;
  is_active: boolean;
  sports_fields_count: number;
  sports_fields?: SportsField[];
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  customer_id: number;
  sports_field_id: number;
  venue_id: number;
  starts_at: string;
  ends_at: string;
  total_price: string;
  status: ReservationStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  notes: string | null;
  expires_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  customer: Pick<User, 'id' | 'name' | 'email'> | null;
  sports_field: SportsFieldSummary | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  starts_at: string;
  ends_at: string;
  available: boolean;
  reason: string | null;
  total_price: string | null;
}

export interface MaintenanceBlock {
  id: number;
  sports_field_id: number;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignment {
  id: number;
  user: Pick<User, 'id' | 'name' | 'email'>;
  venue: VenueSummary;
}

export interface LoginPayload {
  email: string;
  password: string;
  token_name?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  token_name?: string;
}

export interface VenueFilters {
  page?: number;
  city?: string;
  includeInactive?: boolean;
  includeFields?: boolean;
}

export interface SportsFieldFilters {
  page?: number;
  venueId?: number;
  sportType?: SportType;
  includeInactive?: boolean;
}

export interface ReservationFilters {
  page?: number;
  status?: ReservationStatus;
  customerId?: number;
  sportsFieldId?: number;
  venueId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserFilters {
  page?: number;
  role?: UserRole;
  search?: string;
}

export interface CreateReservationPayload {
  customer_id?: number;
  sports_field_id: number;
  starts_at: string;
  ends_at: string;
  notes?: string | null;
  payment_method?: PaymentMethod | null;
  auto_confirm?: boolean;
}

export interface ConfirmReservationPayload {
  payment_method: PaymentMethod;
  payment_reference?: string | null;
}

export interface CancelReservationPayload {
  reason: string;
}

export interface CreateVenuePayload {
  name: string;
  address: string;
  city: string;
  description?: string | null;
  is_active?: boolean;
}

export interface CreateSportsFieldPayload {
  venue_id: number;
  name: string;
  sport_type: SportType;
  description?: string | null;
  hourly_rate: string;
  open_time: string;
  close_time: string;
  max_players?: number | null;
  is_active?: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  venue_ids?: number[];
}

export interface StaffAssignmentPayload {
  user_id: number;
  venue_ids: number[];
}

export interface CreateMaintenanceBlockPayload {
  starts_at: string;
  ends_at: string;
  reason: string;
}
