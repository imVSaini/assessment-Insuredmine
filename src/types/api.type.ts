/**
 * API Response Types
 * Standardized response interfaces for consistent API responses
 */

export interface BaseResponse {
  success: boolean
  message: string
}

export interface SuccessResponse<T = unknown> extends BaseResponse {
  success: true
  data?: T
}

export interface ErrorResponse extends BaseResponse {
  success: false
  code?: string
  stack?: string
}

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'down'
  responseTime?: number
  details?: string
}

export interface HealthResponse extends BaseResponse {
  success: true
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  services?: Record<string, HealthCheck>
  version: string
  environment: string
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Model response types
 */
export interface ModelResponse<T> extends SuccessResponse<T> {
  count?: number
}

export interface ModelListResponse<T> extends SuccessResponse<T[]> {
  count: number
}
