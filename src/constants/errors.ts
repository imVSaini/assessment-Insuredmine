/**
 * Error Messages
 * Standardized error messages used across the application
 */
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  ROUTE_NOT_FOUND: 'Route not found',
  TOO_MANY_REQUESTS: 'Too many requests from this IP, please try again later.',
  HEALTH_CHECK_FAILED: 'Health check failed',
} as const

/**
 * Error Types
 * Standardized error type constants
 */
export const ERROR_TYPES = {
  APP_ERROR: 'AppError',
  NOT_FOUND_ERROR: 'NotFoundError',
  UNKNOWN_ERROR: 'UnknownError',
} as const

/**
 * Error Codes
 * Standardized error codes for different error scenarios
 */
export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  HEALTH_CHECK_ERROR: 'HEALTH_CHECK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const
