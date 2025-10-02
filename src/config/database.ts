import mongoose from 'mongoose'

import { env } from '@config/env'
import logger from '@config/logger'

/**
 * Initialize MongoDB connection
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI)
    logger.info('✅ MongoDB connected successfully')
  } catch (error) {
    logger.warn('⚠️ MongoDB connection failed:', error as Error)
  }
}

/**
 * Close MongoDB connection
 */
export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.close()
  logger.info('✅ MongoDB disconnected')
}

/**
 * Get MongoDB connection status
 */
export const getConnectionStatus = (): string => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}
