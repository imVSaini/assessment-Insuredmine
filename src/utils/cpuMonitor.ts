import { spawn } from 'child_process'
import os from 'os'

import logger from '@/config/logger'

class CPUMonitor {
  private checkInterval: NodeJS.Timeout | null = null
  private readonly threshold: number = 70 // 70% CPU usage threshold
  private readonly checkIntervalMs: number = 5000 // Check every 5 seconds
  private isRestarting: boolean = false

  /**
   * Start monitoring CPU usage
   */
  start(): void {
    if (this.checkInterval) {
      logger.warn('CPU monitoring is already running')
      return
    }

    logger.info(`Starting CPU monitoring (threshold: ${this.threshold}%)`)

    this.checkInterval = setInterval(() => {
      void this.checkCPUUsage()
    }, this.checkIntervalMs)
  }

  /**
   * Stop monitoring CPU usage
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      logger.info('CPU monitoring stopped')
    }
  }

  /**
   * Check current CPU usage
   */
  private async checkCPUUsage(): Promise<void> {
    try {
      const cpuUsage = await this.getCPUUsage()

      logger.debug(`Current CPU usage: ${cpuUsage.toFixed(2)}%`)

      if (cpuUsage >= this.threshold && !this.isRestarting) {
        logger.warn(
          `CPU usage (${cpuUsage.toFixed(2)}%) exceeded threshold (${this.threshold}%). Initiating server restart...`
        )
        await this.restartServer()
      }
    } catch (error) {
      logger.error(
        `Error checking CPU usage: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get current CPU usage percentage
   */
  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const cpus = os.cpus()
      let totalIdle = 0
      let totalTick = 0

      cpus.forEach((cpu) => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type as keyof typeof cpu.times]
        }
        totalIdle += cpu.times.idle
      })

      const idle = totalIdle / cpus.length
      const total = totalTick / cpus.length
      const usage = 100 - Math.floor((100 * idle) / total)

      resolve(usage)
    })
  }

  /**
   * Restart the server
   */
  private async restartServer(): Promise<void> {
    if (this.isRestarting) {
      logger.warn('Server restart already in progress')
      return
    }

    this.isRestarting = true
    logger.warn('Initiating server restart due to high CPU usage...')

    try {
      // Graceful shutdown first
      process.emit('SIGTERM')

      // Wait a bit for graceful shutdown
      setTimeout(() => {
        logger.info('Starting new server instance...')

        // Start new server instance
        const newServer = spawn(
          'node',
          ['-r', 'dotenv/config', 'dist/server.js'],
          {
            detached: true,
            stdio: 'inherit',
          }
        )

        newServer.unref()

        // Exit current process
        // eslint-disable-next-line node/no-process-exit
        process.exit(0)
      }, 3000) // 3 second delay for graceful shutdown
    } catch (error) {
      logger.error(
        `Error during server restart: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      this.isRestarting = false
    }
  }

  /**
   * Get current monitoring status
   */
  getStatus(): {
    isMonitoring: boolean
    threshold: number
    isRestarting: boolean
  } {
    return {
      isMonitoring: this.checkInterval !== null,
      threshold: this.threshold,
      isRestarting: this.isRestarting,
    }
  }
}

export default new CPUMonitor()
