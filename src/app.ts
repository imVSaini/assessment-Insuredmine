import path from 'node:path'

import express from 'express'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'

import healthRoutes from '@/routes/health.routes'
import { env } from '@config/env'
import logger from '@config/logger'
import { swaggerSpec, swaggerUiOptions } from '@config/swagger'
import { errorHandler } from '@middlewares/errorHandler.middleware'
import { notFound } from '@middlewares/notFound.middleware'
import { generalRateLimiter } from '@middlewares/rateLimit.middleware'
import { requestId, userAgent } from '@middlewares/request.middleware'

const REQUEST_LIMITS_OPTIONS = {
  urlencoded: { extended: false, limit: '50kb' },
  json: { limit: '50kb' },
} as const

const app: express.Application = express()

app.use(requestId)
app.use(userAgent)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(morgan('combined', { stream: (logger as any).stream }))
app.use(generalRateLimiter)
app.use(express.urlencoded(REQUEST_LIMITS_OPTIONS.urlencoded))
app.use(express.json(REQUEST_LIMITS_OPTIONS.json))
app.use(express.static(path.join(__dirname, 'public')))
app.get('/api-docs/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.json(swaggerSpec)
})
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
)

// API routes
app.use(`${env.API_PREFIX}/health`, healthRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
