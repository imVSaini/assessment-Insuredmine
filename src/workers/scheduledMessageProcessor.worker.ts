import { parentPort } from 'worker_threads'

import logger from '@config/logger'
import {
  IScheduledMessage,
  ScheduledMessage,
  ScheduledMessageStatus,
} from '@models/ScheduledMessage'

class ScheduledMessageProcessor {
  private isRunning: boolean = false
  private checkInterval: NodeJS.Timeout | null = null
  private readonly checkIntervalMs: number = 60000 // Check every minute

  start(): void {
    if (this.isRunning) {
      logger.warn('Scheduled message processor is already running')
      return
    }

    this.isRunning = true
    logger.info('Starting scheduled message processor')

    this.checkInterval = setInterval(() => {
      void this.processScheduledMessages()
    }, this.checkIntervalMs)

    // Process immediately on start
    void this.processScheduledMessages()
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    logger.info('Scheduled message processor stopped')
  }

  private async processScheduledMessages(): Promise<void> {
    try {
      const now = new Date()

      // Find messages that are due to be sent
      const dueMessages = await ScheduledMessage.find({
        status: ScheduledMessageStatus.PENDING,
        scheduledDateTime: { $lte: now },
      })

      logger.info(`Found ${dueMessages.length} messages due for processing`)

      for (const message of dueMessages) {
        await this.processMessage(message)
      }
    } catch (error) {
      logger.error('Error processing scheduled messages:', error)
    }
  }

  private async processMessage(message: IScheduledMessage): Promise<void> {
    try {
      logger.info(`Processing scheduled message: ${message._id}`)

      // Update status to processing
      await ScheduledMessage.findByIdAndUpdate(message._id, {
        status: ScheduledMessageStatus.PROCESSING,
      })

      // Simulate message sending (replace with actual implementation)
      const success = await this.sendMessage(message)

      if (success) {
        await ScheduledMessage.findByIdAndUpdate(message._id, {
          status: ScheduledMessageStatus.SENT,
          sentAt: new Date(),
        })
        logger.info(`Message ${message._id} sent successfully`)
      } else {
        await ScheduledMessage.findByIdAndUpdate(message._id, {
          status: ScheduledMessageStatus.FAILED,
          errorMessage: 'Failed to send message',
        })
        logger.error(`Failed to send message ${message._id}`)
      }
    } catch (error) {
      logger.error(`Error processing message ${message._id}:`, error)

      await ScheduledMessage.findByIdAndUpdate(message._id, {
        status: ScheduledMessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  private async sendMessage(message: IScheduledMessage): Promise<boolean> {
    try {
      // This is a placeholder implementation
      // In a real application, you would integrate with:
      // - Email service (SendGrid, AWS SES, etc.)
      // - SMS service (Twilio, etc.)
      // - Push notification service
      // - Webhook endpoints

      logger.info(
        `Sending message to ${message.recipient ?? 'default recipient'}: ${message.message}`
      )

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate 95% success rate
      return Math.random() > 0.05
    } catch (error) {
      logger.error('Error in sendMessage:', error)
      return false
    }
  }
}

// Worker thread entry point
if (parentPort) {
  const processor = new ScheduledMessageProcessor()

  // Start processing
  processor.start()

  // Handle worker termination
  process.on('SIGTERM', () => {
    processor.stop()
    // eslint-disable-next-line node/no-process-exit
    process.exit(0)
  })

  process.on('SIGINT', () => {
    processor.stop()
    // eslint-disable-next-line node/no-process-exit
    process.exit(0)
  })
}
