import { FastifySwaggerOptions } from '@fastify/swagger'
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'

export const gymSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: ['string', 'null'] },
    phone: { type: ['string', 'null'] },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
  },
}

export const checkInSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    gym_id: { type: 'string', format: 'uuid' },
    created_at: { type: 'string', format: 'date-time' },
    validated_at: { type: ['string', 'null'], format: 'date-time' },
  },
}

export const swaggerOptions: FastifySwaggerOptions = {
  openapi: {
      info: {
        title: 'Gympass API',
        description: 'API para usuários, academias e check-ins.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          refreshToken: { type: 'apiKey', in: 'cookie', name: 'refreshToken' },
        },
        schemas: {
          Gym: gymSchema,
          CheckIn: checkInSchema,
        },
      },
  },
}

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list', deepLinking: false },
}

export const authenticated = [{ bearerAuth: [] }]
export const adminOnly = [{ bearerAuth: [] }]

export const validationError = {
  type: 'object',
  properties: { message: { type: 'string', example: 'Validation error.' } },
}

export const unauthorizedError = {
  type: 'object',
  properties: { message: { type: 'string', example: 'Unauthorized' } },
}
