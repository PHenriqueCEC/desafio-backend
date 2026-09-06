import { FastifyInstance } from "fastify";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { search } from "./search";
import { nearby } from "./nearby";
import { create } from "./create";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { adminOnly, authenticated, gymSchema, unauthorizedError, validationError } from '@/http/swagger'

export async function gymsRoutes(app: FastifyInstance) {
   app.addHook('onRequest', verifyJWT)

   app.get('/gyms/search', {
     schema: {
       tags: ['Gyms'],
       summary: 'Pesquisar academias',
       security: authenticated,
       querystring: {
         type: 'object',
         required: ['q'],
         properties: {
           q: { type: 'string', example: 'Smart Fit' },
           page: { type: 'integer', minimum: 1, default: 1 }
         }
       },
       response: {
         200: {
           type: 'object',
           properties: {
             gyms: {
               type: 'array',
               items: gymSchema
             }
           }
         },
         401: unauthorizedError
       }
     }
   }, search)

   app.get('/gyms/nearby', {
     schema: {
       tags: ['Gyms'],
       summary: 'Listar academias próximas',
       security: authenticated,
       querystring: {
         type: 'object',
         required: ['latitude', 'longitude'],
         properties: {
           latitude: { type: 'number', minimum: -90, maximum: 90, example: -23.5505 },
           longitude: { type: 'number', minimum: -180, maximum: 180, example: -46.6333 }
         }
       },
       response: {
         200: {
           type: 'object',
           properties: {
             gyms: {
               type: 'array',
               items: gymSchema
             }
           }
         },
         401: unauthorizedError
       }
     }
   }, nearby)

   app.post('/gyms', {
     onRequest: [verifyUserRole('ADMIN')],
     schema: {
       tags: ['Gyms'],
       summary: 'Criar academia (ADMIN)',
       security: adminOnly,
       body: {
         type: 'object',
         required: ['title', 'description', 'phone', 'latitude', 'longitude'],
         properties: {
           title: { type: 'string', example: 'Academia Central' },
           description: { type: ['string', 'null'] },
           phone: { type: ['string', 'null'] },
           latitude: { type: 'number', minimum: -90, maximum: 90 },
           longitude: { type: 'number', minimum: -180, maximum: 180 }
         }
       },
       response: {
         201: { type: 'null' },
         400: validationError,
         401: unauthorizedError
       }
     }
   }, create)
}