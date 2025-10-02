/**
 * Global Error Handler Middleware
 * Centralized error handling for all application errors
 */

import type { ErrorRequestHandler, Request, Response } from 'express'

import { isDevelopment } from '@config/env'
import logger from '@config/logger'
import { AppError, NotFoundError } from '@utils/errors'

import { getErrorDetails } from '../utils/errorUtils'

/**
 * Global error handler middleware
 * Handles all errors and returns normalized JSON responses
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next
): void => {
  // Get error details for logging
  const errorDetails = getErrorDetails(error)

  // Log the comprehensive error details
  logger.error({
    message: error.message,
    statusCode: errorDetails.statusCode,
    code: errorDetails.code,
    errorType: errorDetails.errorType,
    url: req.url,
    method: req.method,
    requestId: (req as Request & { requestId?: string }).requestId,
    ...(errorDetails.isOperational !== undefined && {
      isOperational: errorDetails.isOperational,
    }),
    ...(isDevelopment() && { stack: error.stack }),
  })

  // Handle known error types
  if (error instanceof NotFoundError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    })
    return
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      ...(isDevelopment() && { stack: error.stack }),
    })
    return
  }

  // Handle unknown errors (default to 500 Internal Server Error)
  const internalError = new AppError()
  res.status(internalError.statusCode).json({
    success: false,
    message: internalError.message,
    statusCode: internalError.statusCode,
    code: internalError.code,
    ...(isDevelopment() && { stack: error.stack }),
  })
}
