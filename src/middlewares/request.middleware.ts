/**
 * Request Middleware
 * Adds request tracking and user agent parsing
 */

import { randomUUID } from 'node:crypto'

import type { NextFunction, Request, Response } from 'express'
import type { IBrowser, ICPU, IDevice, IEngine, IOS } from 'ua-parser-js'
import { UAParser } from 'ua-parser-js'

import logger from '@config/logger'

interface RequestWithUserAgent extends Request {
  requestId: string
  userAgent: {
    browser: IBrowser
    os: IOS
    device: IDevice
    engine: IEngine
    cpu: ICPU
  }
  startTime: number
}

/**
 * Add request ID to each request
 * Uses x-request-id from header if present, otherwise generates a new UUID
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const existingRequestId = req.headers['x-request-id']
  const id = existingRequestId?.toString() ?? randomUUID()

  // Make request ID available in req object
  ;(req as RequestWithUserAgent).requestId = id

  // Add request ID to response headers
  res.setHeader('x-request-id', id)

  next()
}

/**
 * Parse user agent and add to request object
 */
export const userAgent = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const parser = UAParser(req.headers['user-agent'] ?? '')
  ;(req as RequestWithUserAgent).userAgent = {
    browser: parser.browser,
    os: parser.os,
    device: parser.device,
    engine: parser.engine,
    cpu: parser.cpu,
  }
  next()
}

/**
 * Add request timing for performance monitoring
 */
export const requestTiming = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add start time to request object
  ;(req as RequestWithUserAgent).startTime = Date.now()

  // Log request completion with timing
  res.on('finish', () => {
    const duration = Date.now() - (req as RequestWithUserAgent).startTime
    const requestId = (req as RequestWithUserAgent).requestId

    logger.info({
      message: 'Request completed',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId,
    })
  })

  next()
}
