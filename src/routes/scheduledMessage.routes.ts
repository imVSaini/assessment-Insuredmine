import { Router } from 'express'

import {
  createScheduledMessage,
  deleteScheduledMessage,
  getScheduledMessageById,
  getScheduledMessages,
  updateScheduledMessage,
} from '@controllers/scheduledMessage.controller'

const router: Router = Router()

/**
 * @swagger
 * /scheduled-messages:
 *   post:
 *     summary: Create a scheduled message
 *     tags: [Scheduled Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - scheduledDate
 *               - scheduledTime
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message content to be sent
 *                 example: "Reminder: Your policy expires in 30 days"
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *                 description: The date when the message should be sent (YYYY-MM-DD)
 *                 example: "2024-12-25"
 *               scheduledTime:
 *                 type: string
 *                 pattern: '^([01]?\d|2[0-3]):[0-5]\d$'
 *                 description: The time when the message should be sent (HH:MM)
 *                 example: "14:30"
 *               recipient:
 *                 type: string
 *                 description: Optional recipient identifier
 *                 example: "user@example.com"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 description: Message priority level
 *     responses:
 *       201:
 *         description: Scheduled message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     message:
 *                       type: string
 *                     scheduledDate:
 *                       type: string
 *                       format: date
 *                     scheduledTime:
 *                       type: string
 *                     scheduledDateTime:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
// Create a new scheduled message
router.post('/', createScheduledMessage)

/**
 * @swagger
 * /scheduled-messages:
 *   get:
 *     summary: Get all scheduled messages
 *     tags: [Scheduled Messages]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed, cancelled]
 *         description: Filter by message status
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
 *         description: Scheduled messages retrieved successfully
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
 *                     messages:
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
 *       500:
 *         description: Internal server error
 */
// Get all scheduled messages
router.get('/', getScheduledMessages)

/**
 * @swagger
 * /scheduled-messages/{id}:
 *   get:
 *     summary: Get a specific scheduled message by ID
 *     tags: [Scheduled Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheduled message ID
 *     responses:
 *       200:
 *         description: Scheduled message retrieved successfully
 *       404:
 *         description: Scheduled message not found
 *       500:
 *         description: Internal server error
 */
// Get a specific scheduled message by ID
router.get('/:id', getScheduledMessageById)

/**
 * @swagger
 * /scheduled-messages/{id}:
 *   put:
 *     summary: Update a scheduled message
 *     tags: [Scheduled Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheduled message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               scheduledTime:
 *                 type: string
 *                 pattern: '^([01]?\d|2[0-3]):[0-5]\d$'
 *               recipient:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [pending, sent, failed, cancelled]
 *     responses:
 *       200:
 *         description: Scheduled message updated successfully
 *       404:
 *         description: Scheduled message not found
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
// Update a scheduled message
router.put('/:id', updateScheduledMessage)

/**
 * @swagger
 * /scheduled-messages/{id}:
 *   delete:
 *     summary: Delete a scheduled message
 *     tags: [Scheduled Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scheduled message ID
 *     responses:
 *       200:
 *         description: Scheduled message deleted successfully
 *       404:
 *         description: Scheduled message not found
 *       500:
 *         description: Internal server error
 */
// Delete a scheduled message
router.delete('/:id', deleteScheduledMessage)

export default router
