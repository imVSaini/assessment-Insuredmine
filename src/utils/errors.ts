/**
 * Custom Error Classes
 * Centralized error classes for the application
 */

import type { IAppError, INotFoundError } from '@/types/errors.type'
import { ERROR_CODES, ERROR_MESSAGES, ERROR_TYPES } from '@constants/errors'
import { HTTP_STATUS } from '@constants/http'

/**
 * App Error Class
 * For unexpected/unhandled errors
 */
export class AppError extends Error implements IAppError {
  public readonly type = ERROR_TYPES.APP_ERROR
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(
    message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code ?? ERROR_CODES.INTERNAL_SERVER_ERROR

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Not Found Error Class
 * For routes not found
 */
export class NotFoundError extends Error implements INotFoundError {
  public readonly type = ERROR_TYPES.NOT_FOUND_ERROR
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code: string

  constructor(message: string = ERROR_MESSAGES.ROUTE_NOT_FOUND) {
    super(message)
    this.statusCode = HTTP_STATUS.NOT_FOUND
    this.isOperational = true
    this.code = ERROR_CODES.NOT_FOUND

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }
}
