import { Router } from 'express'

import {
  getAggregatedPolicies,
  getPolicyStats,
  searchPoliciesByUsername,
} from '@controllers/policy.controller'

const router: Router = Router()

/**
 * @swagger
 * /policies/search:
 *   get:
 *     summary: Search policies by username (email)
 *     tags: [Policies]
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: User email to search for
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Policies found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     policies:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         pages:
 *                           type: number
 *       400:
 *         description: Bad request - Missing username parameter
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
// Search policies by username
router.get('/search', searchPoliciesByUsername)

/**
 * @swagger
 * /policies/aggregated:
 *   get:
 *     summary: Get aggregated policies grouped by user
 *     tags: [Policies]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: userType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Active Client, Prospect, Inactive]
 *         description: Filter by user type
 *     responses:
 *       200:
 *         description: Aggregated policies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     aggregatedPolicies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               userType:
 *                                 type: string
 *                               agent:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                           policyCount:
 *                             type: number
 *                           totalPremiumAmount:
 *                             type: number
 *                           policies:
 *                             type: array
 *                             items:
 *                               type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         pages:
 *                           type: number
 *       500:
 *         description: Internal server error
 */
// Get aggregated policies grouped by user
router.get('/aggregated', getAggregatedPolicies)

/**
 * @swagger
 * /policies/stats:
 *   get:
 *     summary: Get policy statistics
 *     tags: [Policies]
 *     responses:
 *       200:
 *         description: Policy statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPolicies:
 *                       type: number
 *                     totalUsers:
 *                       type: number
 *                     totalAgents:
 *                       type: number
 *                     totalCarriers:
 *                       type: number
 *                     totalCategories:
 *                       type: number
 *                     averagePoliciesPerUser:
 *                       type: number
 *                     totalPremiumAmount:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
// Get policy statistics
router.get('/stats', getPolicyStats)

export default router
