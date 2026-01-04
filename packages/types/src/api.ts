/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Error response from API
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
