/**
 * Server Entry Point
 * Starts the Express server and handles graceful shutdown
 */

import cluster from 'node:cluster'
import http from 'node:http'
import path from 'path'
import { Worker } from 'worker_threads'

import app from '@/app'
import { closeDatabase, initializeDatabase } from '@config/database'
import { env } from '@config/env'
import logger from '@config/logger'
import cpuMonitor from '@utils/cpuMonitor'

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
  let messageProcessor: Worker | null = null

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

      // Start scheduled message processor
      messageProcessor = new Worker(
        path.join(
          process.cwd(),
          'src/workers/scheduledMessageProcessor.worker.ts'
        ),
        {
          execArgv: ['-r', 'ts-node/register'],
        }
      )
      messageProcessor.on('error', (error) => {
        logger.error('Scheduled message processor error:', error)
      })
      messageProcessor.on('exit', (code) => {
        if (code !== 0) {
          logger.error(
            `Scheduled message processor stopped with exit code ${code}`
          )
        }
      })
    })

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string): void => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`)

      // Stop CPU monitoring
      cpuMonitor.stop()

      // Terminate scheduled message processor
      if (messageProcessor) {
        void messageProcessor.terminate()
      }

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
  if (cluster.isPrimary) {
    void startServer()
  } else {
    // This is a cluster worker - run the CSV cluster worker
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./workers/csvClusterWorker')
  }
}

export default startServer
