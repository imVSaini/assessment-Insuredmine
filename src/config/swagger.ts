/**
 * Swagger/OpenAPI Configuration
 *
 * Features:
 * - OpenAPI 3.0 specification
 * - Environment-aware server URLs
 * - Comprehensive security schemes
 * - Reusable components and schemas
 * - Rate limiting documentation
 * - Standardized error responses
 */

import type { SwaggerDefinition } from 'swagger-jsdoc'
import swaggerJSDoc from 'swagger-jsdoc'

import { env } from './env'

/**
 * OpenAPI specification definition
 */
const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'InsuredMine API',
    version: '1.0.0',
    description:
      'Insurance management system API for managing users, agents, policies, carriers, and more',
    contact: {
      name: 'API Support',
      email: 'support@insuredmine.com',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: `http://${env.NODE_ENV === 'development' ? 'localhost' : env.HOST}:${env.PORT}${env.API_PREFIX}`,
      description: `${env.NODE_ENV.charAt(0).toUpperCase() + env.NODE_ENV.slice(1)} server`,
    },
  ],
  components: {
    schemas: {
      // Success responses
      SuccessResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: 'Indicates if the request was successful',
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
            description: 'Human-readable success message',
          },
          data: {
            type: 'object',
            description: 'Response payload (varies by endpoint)',
          },
        },
      },

      // Error responses
      ErrorResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean',
            example: false,
            description: 'Always false for error responses',
          },
          message: {
            type: 'string',
            example: 'An error occurred',
            description: 'Human-readable error message',
          },
          code: {
            type: 'string',
            example: 'INTERNAL_SERVER_ERROR',
            description: 'Machine-readable error code',
          },
          stack: {
            type: 'string',
            description: 'Error stack trace (development only)',
          },
        },
        example: {
          success: false,
          message: 'An error occurred',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },

      // Health check response
      HealthResponse: {
        type: 'object',
        required: ['success', 'status', 'timestamp'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          status: {
            type: 'string',
            example: 'ok',
            enum: ['ok', 'degraded', 'down'],
            description: 'Overall system health status',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
            description: 'ISO 8601 timestamp of the health check',
          },
          services: {
            type: 'object',
            description: 'Health status of individual services',
            additionalProperties: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['ok', 'degraded', 'down'],
                },
                responseTime: {
                  type: 'number',
                  description: 'Response time in milliseconds',
                },
                details: {
                  type: 'string',
                  description: 'Additional status information',
                },
              },
            },
          },
          version: {
            type: 'string',
            example: '1.0.0',
            description: 'API version',
          },
          environment: {
            type: 'string',
            example: 'development',
            enum: ['development', 'production', 'test'],
            description: 'Current environment',
          },
        },
        example: {
          success: true,
          status: 'ok',
          timestamp: '2024-01-15T10:30:00.000Z',
          services: {
            database: {
              status: 'ok',
              responseTime: 12,
            },
            redis: {
              status: 'ok',
              responseTime: 3,
            },
          },
          version: '1.0.0',
          environment: 'development',
        },
      },

      // Rate limit response
      RateLimitResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                example:
                  'Too many requests from this IP, please try again later.',
              },
            },
          },
        ],
      },
    },

    responses: {
      // Common error responses
      BadRequest: {
        description: 'Bad Request - Invalid input data',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              badRequestError: {
                summary: 'Bad Request Error',
                value: {
                  success: false,
                  message: 'Bad request',
                  code: 'BAD_REQUEST',
                },
              },
            },
          },
        },
      },

      NotFound: {
        description: 'Not Found - Resource does not exist',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Route not found',
              code: 'NOT_FOUND',
            },
          },
        },
      },

      TooManyRequests: {
        description: 'Too Many Requests - Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RateLimitResponse' },
            example: {
              success: false,
              message:
                'Too many requests from this IP, please try again later.',
            },
          },
        },
        headers: {
          'X-RateLimit-Limit': {
            description: 'Request limit per time window',
            schema: { type: 'integer' },
          },
          'X-RateLimit-Remaining': {
            description: 'Remaining requests in current window',
            schema: { type: 'integer' },
          },
          'X-RateLimit-Reset': {
            description: 'Time when the rate limit resets',
            schema: { type: 'string', format: 'date-time' },
          },
        },
      },

      InternalServerError: {
        description: 'Internal Server Error - Something went wrong',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Internal server error',
              code: 'INTERNAL_ERROR',
            },
          },
        },
      },
    },

    parameters: {
      // Common query parameters
      PageQuery: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination (1-based)',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        example: 1,
      },

      LimitQuery: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
        },
        example: 20,
      },

      SortQuery: {
        name: 'sort',
        in: 'query',
        description:
          'Sort field and direction (e.g., "name:asc", "createdAt:desc")',
        required: false,
        schema: {
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9]*:(asc|desc)$',
        },
        example: 'createdAt:desc',
      },

      SearchQuery: {
        name: 'search',
        in: 'query',
        description: 'Search term for filtering results',
        required: false,
        schema: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        example: 'john doe',
      },
    },
  },

  // Global security requirement (can be overridden per endpoint)
  security: [
    {
      bearerAuth: [],
    },
  ],

  // Global tags for organizing endpoints
  tags: [
    {
      name: 'Health',
      description: 'Health check and system status endpoints',
    },
  ],

  // External documentation
  externalDocs: {
    description: 'InsuredMine Documentation',
    url: 'https://docs.insuredmine.com',
  },
}

/**
 * Swagger JSDoc options
 */
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/middlewares/*.ts',
    './src/docs/*.ts',
    './src/app.ts',
  ],
}

/**
 * Generate Swagger specification
 */
export const swaggerSpec = swaggerJSDoc(swaggerOptions)

/**
 * Swagger UI options
 */
export const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 10px; border-radius: 4px; }
  `,
  customSiteTitle: 'InsuredMine API Documentation',
}
