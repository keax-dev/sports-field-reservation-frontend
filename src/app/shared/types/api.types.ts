export interface ApiResponse<T> {
  data: T;
}

export interface ApiMessageResponse<T> {
  message: string;
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface LaravelValidationErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
