/**
 * Rate Limiting
 * Standardized rate limiting settings used throughout the application
 */
export const RATE_LIMITS = {
  GENERAL_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_MAX_REQUESTS: 100,
} as const
