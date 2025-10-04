import { Schema, model } from 'mongoose'

import { BaseDocument } from './BaseModel'

/**
 * Scheduled message status enum
 */
export enum ScheduledMessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
}

/**
 * ScheduledMessage interface
 */
export interface IScheduledMessage extends BaseDocument {
  message: string
  day: string
  time: string
  scheduledDateTime?: Date
  recipient?: string | null
  priority?: string
  status: ScheduledMessageStatus
  errorMessage?: string
}

/**
 * ScheduledMessage schema
 */
const scheduledMessageSchema = new Schema<IScheduledMessage>(
  {
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Day must be in YYYY-MM-DD format'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
      match: [/^([01]?\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'],
    },
    scheduledDateTime: {
      type: Date,
      required: false,
    },
    recipient: {
      type: String,
      required: false,
      default: null,
    },
    priority: {
      type: String,
      required: false,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be one of: low, medium, high',
      },
      default: 'medium',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: Object.values(ScheduledMessageStatus),
        message: 'Status must be one of: pending, processing, sent, failed',
      },
      default: ScheduledMessageStatus.PENDING,
    },
    errorMessage: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

/**
 * Create indexes
 */
scheduledMessageSchema.index({ day: 1 })
scheduledMessageSchema.index({ time: 1 })
scheduledMessageSchema.index({ status: 1 })
scheduledMessageSchema.index({ createdAt: 1 })

/**
 * ScheduledMessage model
 */
export const ScheduledMessage = model<IScheduledMessage>(
  'ScheduledMessage',
  scheduledMessageSchema
)
