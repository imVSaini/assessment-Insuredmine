/**
 * Error Utility Functions
 * Helper functions for error handling and logging
 */

import { ERROR_CODES, ERROR_TYPES } from '@constants/errors'

import { AppError, NotFoundError } from './errors'

/**
 * Extract error details for logging
 */
export const getErrorDetails = (error: Error) => {
  if (error instanceof NotFoundError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      errorType: ERROR_TYPES.NOT_FOUND_ERROR,
    }
  }

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      errorType: ERROR_TYPES.APP_ERROR,
      isOperational: error.isOperational,
    }
  }

  return {
    statusCode: 500,
    code: ERROR_CODES.UNKNOWN_ERROR,
    errorType: ERROR_TYPES.UNKNOWN_ERROR,
  }
}
