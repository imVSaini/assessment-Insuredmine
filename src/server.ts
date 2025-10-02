/**
 * Server Entry Point
 * Starts the Express server and handles graceful shutdown
 */

import http from 'node:http'

import app from '@/app'
import cpuMonitor from '@/utils/cpuMonitor'
import { closeDatabase, initializeDatabase } from '@config/database'
import { env } from '@config/env'
import logger from '@config/logger'

/**
 * Centralized shutdown function
 * Handles all process exit scenarios with proper logging
 */
const shutdown = (code: number, reason: string): void => {
  logger.info(`Shutting down server: ${reason}`)
  logger.info(`Exit code: ${code}`)
  // eslint-disable-next-line node/no-process-exit
  process.exit(code)
}

/**
 * Start the Express server
 * @returns Promise that resolves when server starts successfully
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase()

    const server = http.createServer(app)

    server.listen(env.PORT, env.HOST, () => {
      logger.info(`🚀 Server running at: http://${env.HOST}:${env.PORT}`)
      logger.info(
        `📚 API Documentation: http://${env.HOST}:${env.PORT}/api-docs`
      )
      logger.info(`💡 Health check: http://${env.HOST}:${env.PORT}/health`)
      logger.info(`⏳ Environment: ${env.NODE_ENV}`)

      // Start CPU monitoring
      cpuMonitor.start()
    })

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string): void => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`)

      // Stop CPU monitoring
      cpuMonitor.stop()

      server.close(() => {
        logger.info('Server closed successfully')

        closeDatabase()
          .then(() => shutdown(0, `Graceful shutdown on ${signal}`))
          .catch(() => shutdown(1, `Graceful shutdown on ${signal}`))
      })

      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        shutdown(1, 'Forced shutdown after timeout')
      }, env.SHUTDOWN_TIMEOUT_MS)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  } catch (error) {
    logger.error('❌ Failed to start server:', error as Error)
    shutdown(1, 'Server startup failure')
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  void startServer()
}

export default startServer
