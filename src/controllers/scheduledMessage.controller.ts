import { Request, RequestHandler, Response } from 'express'

import { ScheduledMessage } from '@models/ScheduledMessage'
import asyncHandler from '@utils/asyncHandler'

export const createScheduledMessage: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      message,
      scheduledDate,
      scheduledTime,
      recipient,
      priority = 'medium',
    } = req.body

    // Validate required fields
    if (!message || !scheduledDate || !scheduledTime) {
      res.status(400).json({
        success: false,
        message: 'Message, scheduledDate, and scheduledTime are required',
      })
      return
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(scheduledDate)) {
      res.status(400).json({
        success: false,
        message: 'scheduledDate must be in YYYY-MM-DD format',
      })
      return
    }

    // Validate time format
    const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/
    if (!timeRegex.test(scheduledTime)) {
      res.status(400).json({
        success: false,
        message: 'scheduledTime must be in HH:MM format (24-hour)',
      })
      return
    }

    // Create scheduled datetime
    const scheduledDateTime = new Date(
      `${scheduledDate}T${scheduledTime}:00.000Z`
    )

    // Validate that the scheduled time is in the future
    if (scheduledDateTime <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future',
      })
      return
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Priority must be one of: low, medium, high',
      })
      return
    }

    // Create scheduled message
    const scheduledMessage = await ScheduledMessage.create({
      message,
      day: scheduledDate,
      time: scheduledTime,
      scheduledDateTime,
      recipient: recipient ?? null,
      priority,
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      message: 'Scheduled message created successfully',
      data: scheduledMessage,
    })
  }
)

export const getScheduledMessages: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query
    const page = parseInt(req.query['page'] as string) ?? 1
    const limit = parseInt(req.query['limit'] as string) ?? 10
    const skip = (page - 1) * limit

    // Build filter criteria
    const filter: Record<string, unknown> = {}
    if (status) {
      filter['status'] = status
    }

    // Get messages with pagination
    const messages = await ScheduledMessage.find(filter)
      .sort({ scheduledDateTime: 1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await ScheduledMessage.countDocuments(filter)
    const pages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    })
  }
)

export const getScheduledMessageById: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const message = await ScheduledMessage.findById(id)

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Scheduled message not found',
      })
      return
    }

    res.json({
      success: true,
      data: message,
    })
  }
)

export const updateScheduledMessage: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const updateData = req.body

    // If updating scheduled date/time, validate and create new datetime
    if (updateData.scheduledDate || updateData.scheduledTime) {
      const message = await ScheduledMessage.findById(id)
      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Scheduled message not found',
        })
        return
      }

      const scheduledDate =
        updateData.scheduledDate ??
        (message as unknown as Record<string, unknown>)['scheduledDate']
      const scheduledTime =
        updateData.scheduledTime ??
        (message as unknown as Record<string, unknown>)['scheduledTime']

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(scheduledDate)) {
        res.status(400).json({
          success: false,
          message: 'scheduledDate must be in YYYY-MM-DD format',
        })
        return
      }

      // Validate time format
      const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/
      if (!timeRegex.test(scheduledTime)) {
        res.status(400).json({
          success: false,
          message: 'scheduledTime must be in HH:MM format (24-hour)',
        })
        return
      }

      updateData.scheduledDateTime = new Date(
        `${scheduledDate}T${scheduledTime}:00.000Z`
      )

      // Validate that the scheduled time is in the future
      if (updateData.scheduledDateTime <= new Date()) {
        res.status(400).json({
          success: false,
          message: 'Scheduled time must be in the future',
        })
        return
      }
    }

    const message = await ScheduledMessage.findByIdAndUpdate(id, updateData, {
      new: true,
    })

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Scheduled message not found',
      })
      return
    }

    res.json({
      success: true,
      message: 'Scheduled message updated successfully',
      data: message,
    })
  }
)

export const deleteScheduledMessage: RequestHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    const message = await ScheduledMessage.findByIdAndDelete(id)

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Scheduled message not found',
      })
      return
    }

    res.json({
      success: true,
      message: 'Scheduled message deleted successfully',
    })
  }
)
