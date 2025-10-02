/**
 * Rate limit middleware configuration
 *
 * Features:
 * - General rate limiter for all routes
 * - Strict rate limiter for authentication endpoints
 * - Rate limiter for password reset endpoints
 * - Rate limiter for OAuth endpoints
 */
import rateLimit from 'express-rate-limit'

import { ERROR_MESSAGES, RATE_LIMITS } from '@constants/index'

/**
 * General rate limiter for all routes
 */
export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL_WINDOW_MS,
  max: RATE_LIMITS.GENERAL_MAX_REQUESTS,
  message: {
    success: false,
    message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
})
