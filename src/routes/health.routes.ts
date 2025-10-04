import { Router } from 'express'

import { healthCheck } from '@controllers/health.controller'
import asyncHandler from '@utils/asyncHandler'

const router: Router = Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: ok
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         uptime:
 *                           type: number
 *                           example: 123.456
 *                         environment:
 *                           type: string
 *                           example: development
 *                         database:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: connected
 *                             connected:
 *                               type: boolean
 *                               example: true
 *                         memory:
 *                           type: object
 *                           properties:
 *                             used:
 *                               type: number
 *                               example: 45
 *                             total:
 *                               type: number
 *                               example: 128
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       example: HEALTH_CHECK_ERROR
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get('/', asyncHandler(healthCheck))

export default router
