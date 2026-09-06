import { FastifyInstance } from "fastify";

import { verifyJWT } from "../../middlewares/verify-jwt";

import { create } from "./create";
import { validate } from "./validate";
import { metrics } from "./metrics";
import { history } from "./history";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { adminOnly, authenticated, checkInSchema, unauthorizedError, validationError } from '@/http/swagger'


export async function checkInsRoutes(app: FastifyInstance) {
   app.addHook('onRequest', verifyJWT)

   app.get('/check-ins/history', { schema: { tags: ['Check-ins'], summary: 'Histórico dos check-ins do usuário', security: authenticated, querystring: { type: 'object', properties: { page: { type: 'integer', minimum: 1, default: 1 } } }, response: { 200: { type: 'object', properties: { checkIn: { type: 'array', items: checkInSchema } } }, 401: unauthorizedError } } }, history)
   app.get('/check-ins/metrics', { schema: { tags: ['Check-ins'], summary: 'Total de check-ins do usuário', security: authenticated, response: { 200: { type: 'object', properties: { checkInsCount: { type: 'integer', example: 3 } } }, 401: unauthorizedError } } }, metrics)

   app.post('/gyms/:gymId/check-ins', { schema: { tags: ['Check-ins'], summary: 'Fazer check-in em uma academia', security: authenticated, params: { type: 'object', required: ['gymId'], properties: { gymId: { type: 'string', format: 'uuid' } } }, body: { type: 'object', required: ['latitude', 'longitude'], properties: { latitude: { type: 'number', minimum: -90, maximum: 90, example: -23.5505 }, longitude: { type: 'number', minimum: -180, maximum: 180, example: -46.6333 } } }, response: { 201: { type: 'null' }, 400: validationError, 401: unauthorizedError } } }, create)
   app.patch('/check-ins/:checkInId/validate', { onRequest: [verifyUserRole('ADMIN')], schema: { tags: ['Check-ins'], summary: 'Validar check-in (ADMIN)', security: adminOnly, params: { type: 'object', required: ['checkInId'], properties: { checkInId: { type: 'string', format: 'uuid' } } }, response: { 204: { type: 'null' }, 400: validationError, 401: unauthorizedError, 404: { type: 'object', properties: { message: { type: 'string' } } } } } } ,validate)

}
