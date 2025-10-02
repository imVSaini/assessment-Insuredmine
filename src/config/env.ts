import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

/**
 * Environment schema validation
 */
const envSchema = z.object({
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z
    .string()
    .default('8000')
    .transform(Number)
    .pipe(z.number().min(1).max(65535)),
  HOST: z.string().default('localhost'),
  SHUTDOWN_TIMEOUT_MS: z
    .string()
    .default('10000')
    .transform(Number)
    .pipe(z.number().min(1000).max(60000)),

  // Database configuration
  MONGODB_URI: z.string().default('mongodb://localhost:27017/insuredmine'),

  // Redis configuration (optional for now)
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z
    .string()
    .default('6379')
    .transform(Number)
    .pipe(z.number().min(1).max(65535)),
  REDIS_PASSWORD: z.string().optional(),
})

/**
 * Parse and validate environment variables
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}`
      )
    }
    throw error
  }
}

/**
 * Validated environment configuration
 */
export const env = parseEnv()

/**
 * Type-safe environment configuration
 */
export type Env = z.infer<typeof envSchema>

/**
 * Check if running in development, production, or test mode
 */
export const isDevelopment = (): boolean => env.NODE_ENV === 'development'
export const isProduction = (): boolean => env.NODE_ENV === 'production'
export const isTest = (): boolean => env.NODE_ENV === 'test'
