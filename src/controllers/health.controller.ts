import { Request, Response } from 'express'

import { getConnectionStatus } from '@config/database'
import { env } from '@config/env'
import logger from '@config/logger'
import { ERROR_MESSAGES } from '@constants/errors'
import { HTTP_STATUS } from '@constants/http'
import { SUCCESS_MESSAGES } from '@constants/success'
import { AppError } from '@utils/errors'

/**
 * Health check controller
 */
export const healthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const dbStatus = getConnectionStatus()

    const healthData = {
      success: true,
      message: SUCCESS_MESSAGES.HEALTH_CHECK_SUCCESS,
      data: {
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        database: {
          status: dbStatus,
          connected: dbStatus === 'connected',
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
    }

    logger.info('Health check requested', {
      requestId: req.headers['x-request-id'],
      userAgent: req.headers['user-agent'],
    })

    res.status(200).json(healthData)
  } catch (error) {
    logger.error('Health check failed:', error as Error)
    throw new AppError(
      ERROR_MESSAGES.HEALTH_CHECK_FAILED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
