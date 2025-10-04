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

/**
 * CSV Processing types
 */
export interface CSVProcessingResult {
  processed: number
  agentsCreated: number
  usersCreated: number
  accountsCreated: number
  categoriesCreated: number
  carriersCreated: number
  policiesCreated: number
  errors: string[]
}

/**
 * MongoDB Aggregation Pipeline types
 */
export interface LookupStage {
  $lookup: {
    from: string
    localField: string
    foreignField: string
    as: string
  }
}

export interface UnwindStage {
  $unwind: string
}

export interface MatchStage {
  $match: Record<string, unknown>
}

export interface GroupStage {
  $group: Record<string, unknown>
}

export interface SortStage {
  $sort: Record<string, 1 | -1>
}

export interface SkipStage {
  $skip: number
}

export interface LimitStage {
  $limit: number
}

export interface CountStage {
  $count: string
}

export type AggregationStage =
  | LookupStage
  | UnwindStage
  | MatchStage
  | GroupStage
  | SortStage
  | SkipStage
  | LimitStage
  | CountStage

/**
 * Policy Search and Aggregation types
 */
export interface PolicySearchParams {
  username: string
  page?: number
  limit?: number
}

export interface PolicyAggregationParams {
  page?: number
  limit?: number
  userType?: string
}

export interface PolicyStats {
  totalPolicies: number
  totalUsers: number
  totalAgents: number
  totalCarriers: number
  totalCategories: number
  averagePoliciesPerUser: number
  totalPremiumAmount: number
}
