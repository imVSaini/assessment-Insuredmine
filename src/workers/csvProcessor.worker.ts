/**
 * CSV Processor Worker
 * Handles CSV data processing in a separate worker thread
 */

import fs from 'fs'
import { parentPort } from 'worker_threads'

import csv from 'csv-parser'

import { initializeDatabase } from '@config/database'
import logger from '@config/logger'
import { Agent } from '@models/Agent'
import { Carrier } from '@models/Carrier'
import { Policy } from '@models/Policy'
import { PolicyCategory } from '@models/PolicyCategory'
import { User, UserGender, UserType } from '@models/User'
import { AccountType, UserAccount } from '@models/UserAccount'

// Type for MongoDB ObjectId
type ObjectId = { toString(): string }

interface CSVRow {
  agent: string
  userType: string
  policy_mode: string
  producer: string
  policy_number: string
  premium_amount_written: string
  premium_amount: string
  policy_type: string
  company_name: string
  category_name: string
  policy_start_date: string
  policy_end_date: string
  csr: string
  account_name: string
  'hasActive ClientPolicy': string
  first_name: string
  last_name: string
  date_of_birth: string
  address: string
  phone_number: string
  state: string
  zip_code: string
  email: string
  gender: string
}

interface ProcessingResult {
  agentsCreated: number
  usersCreated: number
  userAccountsCreated: number
  policyCategoriesCreated: number
  carriersCreated: number
  policiesCreated: number
  errors: string[]
}

class CSVProcessor {
  private agentMap = new Map<string, ObjectId>()
  private userMap = new Map<string, ObjectId>()
  private userAccountMap = new Map<string, ObjectId>()
  private policyCategoryMap = new Map<string, ObjectId>()
  private carrierMap = new Map<string, ObjectId>()

  async processFile(filePath: string): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      agentsCreated: 0,
      usersCreated: 0,
      userAccountsCreated: 0,
      policyCategoriesCreated: 0,
      carriersCreated: 0,
      policiesCreated: 0,
      errors: [],
    }

    try {
      logger.info(`Starting CSV processing in worker thread ${process.pid}`)

      // Initialize database connection
      await initializeDatabase()
      logger.info('Database connected in worker thread')

      const rows: CSVRow[] = []

      // Read and parse CSV file
      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row: CSVRow) => {
            rows.push(row)
          })
          .on('end', () => {
            logger.info(`Parsed ${rows.length} rows from CSV`)
            resolve()
          })
          .on('error', (error) => {
            logger.error('Error reading CSV file:', error)
            reject(error)
          })
      })

      // Process data in batches to avoid memory issues
      const batchSize = 100
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        await this.processBatch(batch, result)
        logger.info(
          `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}`
        )
      }

      logger.info('CSV processing completed in worker thread', result)
      return result
    } catch (error) {
      logger.error('Error in CSV processor:', error)
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
      return result
    }
  }

  private async processBatch(
    rows: CSVRow[],
    result: ProcessingResult
  ): Promise<void> {
    for (const row of rows) {
      try {
        // Process each entity
        await this.processAgent(row, result)
        await this.processUser(row, result)
        await this.processUserAccount(row, result)
        await this.processPolicyCategory(row, result)
        await this.processCarrier(row, result)
        await this.processPolicy(row, result)
      } catch (error) {
        const errorMsg = `Error processing row: ${error instanceof Error ? error.message : 'Unknown error'}`
        logger.error(errorMsg)
        result.errors.push(errorMsg)
      }
    }
  }

  private async processAgent(
    row: CSVRow,
    result: ProcessingResult
  ): Promise<void> {
    const agentName = row.agent?.trim()
    if (!agentName || this.agentMap.has(agentName)) return

    try {
      const agent = await Agent.create({ agentName })
      this.agentMap.set(agentName, agent._id as ObjectId)
      result.agentsCreated++
    } catch (error) {
      logger.error(`Error creating agent ${agentName}:`, error)
      result.errors.push(`Agent creation failed: ${agentName}`)
    }
  }

  private async processUser(
    row: CSVRow,
    result: ProcessingResult
  ): Promise<void> {
    const email = row.email?.trim()
    if (!email || this.userMap.has(email)) return

    try {
      const agentId = this.agentMap.get(row.agent?.trim())
      if (!agentId) {
        result.errors.push(`Agent not found for user: ${email}`)
        return
      }

      const user = await User.create({
        firstName: row.first_name?.trim() || '',
        email,
        phoneNumber: row.phone_number?.trim(),
        gender: this.mapGender(row.gender),
        dateOfBirth: this.parseDate(row.date_of_birth),
        address: row.address?.trim(),
        state: row.state?.trim(),
        zipCode: row.zip_code?.trim(),
        userType: this.mapUserType(row.userType),
        agentId: agentId.toString(),
        isActive: true,
      })

      this.userMap.set(email, user._id as ObjectId)
      result.usersCreated++
    } catch (error) {
      logger.error(`Error creating user ${email}:`, error)
      result.errors.push(`User creation failed: ${email}`)
    }
  }

  private async processUserAccount(
    row: CSVRow,
    result: ProcessingResult
  ): Promise<void> {
    const accountName = row.account_name?.trim()
    if (!accountName || this.userAccountMap.has(accountName)) return

    try {
      const userEmail = row.email?.trim()
      const userId = userEmail ? this.userMap.get(userEmail) : null
      if (!userId) {
        result.errors.push(`User not found for account: ${accountName}`)
        return
      }

      const userAccount = await UserAccount.create({
        accountName,
        accountType: AccountType.PERSONAL,
        userId: userId.toString(),
        isActive: true,
      })

      this.userAccountMap.set(accountName, userAccount._id as ObjectId)
      result.userAccountsCreated++
    } catch (error) {
      logger.error(`Error creating user account ${accountName}:`, error)
      result.errors.push(`User account creation failed: ${accountName}`)
    }
  }

  private async processPolicyCategory(
    row: CSVRow,
    result: ProcessingResult
  ): Promise<void> {
    const categoryName = row.category_name?.trim()
    if (!categoryName || this.policyCategoryMap.has(categoryName)) return

    try {
      const policyCategory = await PolicyCategory.create({ categoryName })
      this.policyCategoryMap.set(categoryName, policyCategory._id as ObjectId)
      result.policyCategoriesCreated++
    } catch (error) {
      logger.error(`Error creating policy category ${categoryName}:`, error)
      result.errors.push(`Policy category creation failed: ${categoryName}`)
    }
  }

  private async processCarrier(
    row: CSVRow,
    result: ProcessingResult
  ): Promise<void> {
    const companyName = row.company_name?.trim()
    if (!companyName || this.carrierMap.has(companyName)) return

    try {
      const carrier = await Carrier.create({ name: companyName })
      this.carrierMap.set(companyName, carrier._id as ObjectId)
      result.carriersCreated++
    } catch (error) {
      logger.error(`Error creating carrier ${companyName}:`, error)
      result.errors.push(`Carrier creation failed: ${companyName}`)
    }
  }

  private async processPolicy(
    row: CSVRow,
    result: ProcessingResult
  ): Promise<void> {
    const policyNumber = row.policy_number?.trim()
    if (!policyNumber) return

    try {
      const userEmail = row.email?.trim()
      const userId = userEmail ? this.userMap.get(userEmail) : null
      const agentId = this.agentMap.get(row.agent?.trim())
      const policyCategoryId = this.policyCategoryMap.get(
        row.category_name?.trim()
      )
      const carrierId = this.carrierMap.get(row.company_name?.trim())

      if (!userId || !agentId || !policyCategoryId || !carrierId) {
        result.errors.push(`Missing references for policy: ${policyNumber}`)
        return
      }

      await Policy.create({
        policyNumber,
        policyStartDate: this.parseDate(row.policy_start_date),
        policyEndDate: this.parseDate(row.policy_end_date),
        premiumAmount: this.parseNumber(row.premium_amount),
        premiumAmountWritten: this.parseNumber(row.premium_amount_written),
        policyType: this.mapPolicyType(row.policy_type),
        policyMode: this.mapPolicyMode(row.policy_mode),
        producer: row.producer?.trim(),
        csr: row.csr?.trim(),
        hasActiveClientPolicy: row['hasActive ClientPolicy'] === 'Yes',
        userId: userId.toString(),
        agentId: agentId.toString(),
        policyCategoryId: policyCategoryId.toString(),
        carrierId: carrierId.toString(),
        isActive: true,
      })

      result.policiesCreated++
    } catch (error) {
      logger.error(`Error creating policy ${policyNumber}:`, error)
      result.errors.push(`Policy creation failed: ${policyNumber}`)
    }
  }

  private mapGender(gender?: string): UserGender {
    if (!gender) return UserGender.OTHER
    const normalized = gender.toLowerCase().trim()
    if (normalized === 'male' || normalized === 'm') return UserGender.MALE
    if (normalized === 'female' || normalized === 'f') return UserGender.FEMALE
    return UserGender.OTHER
  }

  private mapUserType(userType?: string): UserType {
    if (!userType) return UserType.ACTIVE_CLIENT
    const normalized = userType.toLowerCase().trim()
    if (normalized === 'individual' || normalized === 'active client')
      return UserType.ACTIVE_CLIENT
    if (normalized === 'business') return UserType.ACTIVE_CLIENT
    if (normalized === 'prospect') return UserType.PROSPECT
    if (normalized === 'inactive') return UserType.INACTIVE
    return UserType.ACTIVE_CLIENT
  }

  private mapPolicyType(policyType?: string): string {
    if (!policyType) return 'Unknown'
    return policyType.trim()
  }

  private mapPolicyMode(policyMode?: string): string {
    if (!policyMode) return 'Unknown'
    return policyMode.trim()
  }

  private parseDate(dateString?: string): Date | undefined {
    if (!dateString) return undefined
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  }

  private parseNumber(numberString?: string): number {
    if (!numberString) return 0
    const num = parseFloat(numberString.replaceAll(/[^\d.-]/g, ''))
    return isNaN(num) ? 0 : num
  }
}

// Worker thread entry point
if (parentPort) {
  const processor = new CSVProcessor()

  parentPort.on('message', (message: { filePath: string }) => {
    void (async () => {
      try {
        logger.info(
          `Worker thread ${process.pid} received file: ${message.filePath}`
        )
        const result = await processor.processFile(message.filePath)
        parentPort?.postMessage({ success: true, result })
      } catch (error) {
        logger.error(`Worker thread ${process.pid} error:`, error)
        parentPort?.postMessage({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })()
  })

  // Handle worker termination
  process.on('SIGTERM', () => {
    logger.info(`Worker thread ${process.pid} received SIGTERM, shutting down`)
    // eslint-disable-next-line node/no-process-exit
    process.exit(0)
  })

  process.on('SIGINT', () => {
    logger.info(`Worker thread ${process.pid} received SIGINT, shutting down`)
    // eslint-disable-next-line node/no-process-exit
    process.exit(0)
  })
}
