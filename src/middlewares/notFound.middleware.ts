/**
 * Not Found Middleware
 * Catches all unmatched routes and throws NotFoundError
 */

import type { NextFunction, Request, Response } from 'express'

import { NotFoundError } from '@utils/errors'

/**
 * Catch-all middleware for unmatched routes
 * Must be placed after all other routes
 */
export const notFound = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new NotFoundError('Route not found'))
}
