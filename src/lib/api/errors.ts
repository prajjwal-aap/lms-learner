/** Machine-readable codes from the API reference §12.3 (plus our own session codes). */
export type ApiErrorCode =
  | "NOT_FOUND"
  | "NO_ACCESS"
  | "ACCESS_EXPIRED"
  | "LOCKED"
  | "DEVICE_LIMIT"
  | "DOWNLOAD_NOT_ALLOWED"
  | "NOT_MANUAL"
  | "NOT_FREE"
  | "NOT_OPEN_YET"
  | "JOIN_CLOSED"
  | "NOT_REGISTERED"
  | "SESSION_FULL"
  | "REGISTRATION_CLOSED"
  | "SESSION_CANCELLED"
  | "PROVIDER_UNAVAILABLE"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "SESSION_EXPIRED"
  | "TOKEN_EXPIRED"
  | (string & {});

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: ApiErrorCode,
    /** Field → reason on some validation errors. */
    readonly details?: Record<string, string>,
    /** Endpoint-specific extras, e.g. otpStatus or lock info. */
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

export const GENERIC_ERROR = "Something went wrong. Please try again.";
