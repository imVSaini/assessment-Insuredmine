/**
 * Error Types
 * Centralized error type definitions for the application
 */

export interface BaseError {
  message: string
  statusCode: number
  isOperational: boolean
  code?: string
}

export interface IAppError extends BaseError {
  type: 'AppError'
  stack?: string
}

export interface INotFoundError extends BaseError {
  type: 'NotFoundError'
}

export type AppErrorUnion = IAppError | INotFoundError
