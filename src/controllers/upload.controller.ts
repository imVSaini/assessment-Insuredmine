import fs from 'fs'
import cluster from 'node:cluster'
import path from 'path'

import { Request, RequestHandler, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

import logger from '@config/logger'
import asyncHandler from '@utils/asyncHandler'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx']
    const ext = path.extname(file.originalname).toLowerCase()

    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV and XLSX files are allowed'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

export const uploadCSV: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      })
      return
    }

    const filePath = req.file.path
    const originalName = req.file.originalname

    logger.info(`Starting CSV processing for file: ${originalName}`)

    try {
      // Process file using cluster worker (non-blocking)
      const result = await processFileWithCluster(filePath)

      // Clean up uploaded file
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlinkSync(filePath)

      logger.info(`CSV processing completed for file: ${originalName}`, result)

      res.json({
        success: true,
        message: 'File processed successfully',
        data: result,
      })
    } catch (error) {
      logger.error(`Error processing CSV file ${originalName}:`, error)

      // Clean up uploaded file on error
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fs.existsSync(filePath)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(filePath)
      }

      res.status(500).json({
        success: false,
        message: 'Error processing file',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
)

/**
 * Process CSV file using cluster worker
 */
const processFileWithCluster = (filePath: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    if (cluster.isPrimary) {
      // Master process - fork a worker for CSV processing
      const worker = cluster.fork()

      logger.info(
        `Forked cluster worker ${worker.process.pid} for CSV processing`
      )

      // Send file path to worker
      worker.send({ filePath })

      // Handle worker response
      worker.on(
        'message',
        (message: { success: boolean; result?: unknown; error?: string }) => {
          if (message.success) {
            logger.info(
              `CSV processing completed by worker ${worker.process.pid}`
            )
            resolve(message.result)
            worker.kill() // Terminate the worker after processing
          } else {
            logger.error(
              `CSV processing failed in worker ${worker.process.pid}:`,
              message.error
            )
            reject(new Error(message.error))
            worker.kill()
          }
        }
      )

      worker.on('exit', (code) => {
        if (code !== 0) {
          logger.error(
            `Cluster worker ${worker.process.pid} exited with code ${code}`
          )
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })

      // Set timeout for cluster worker (10 minutes)
      setTimeout(
        () => {
          logger.error(`Cluster worker ${worker.process.pid} timeout`)
          worker.kill()
          reject(new Error('Cluster worker timeout'))
        },
        10 * 60 * 1000
      )
    } else {
      // Worker process - this shouldn't happen in the controller
      reject(
        new Error('CSV processing should only be called from master process')
      )
    }
  })
}

export { upload }
