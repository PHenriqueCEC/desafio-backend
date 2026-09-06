import { FastifyInstance } from "fastify";
import { register } from './register'
import { authenticate } from "./authenticate";
import { profile } from "./profile";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { refresh } from "./refresh";
import { updatePassword } from "./update-password";
import { deleteUser } from "./delete";
import { authenticated, unauthorizedError, validationError } from '@/http/swagger'

export async function usersRoutes(app: FastifyInstance) {
    app.post('/users', {
        schema: {
            tags: ['Users'], summary: 'Criar usuário',
            body: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string', example: 'Pedro' }, email: { type: 'string', format: 'email', example: 'pedro@email.com' }, password: { type: 'string', minLength: 6, example: '123456' } } },
            response: { 201: { type: 'null' }, 400: validationError, 409: { type: 'object', properties: { message: { type: 'string', example: 'E-mail already exists.' } } } },
        },
    }, register)
    app.post('/sessions', {
        schema: {
            tags: ['Authentication'], summary: 'Autenticar usuário',
            body: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email', example: 'pedro9admin@gmail.com' }, password: { type: 'string', minLength: 6, example: '123456' } } },
            response: { 200: { type: 'object', properties: { token: { type: 'string', description: 'JWT de acesso' } } }, 400: { type: 'object', properties: { message: { type: 'string' } } } },
        },
    }, authenticate)

    app.patch('/token/refresh', {
        schema: { tags: ['Authentication'], summary: 'Renovar token de acesso', security: [{ refreshToken: [] }], response: { 200: { type: 'object', properties: { token: { type: 'string' } } }, 401: unauthorizedError } },
    }, refresh)

    /** Os Usuários só podem chamar quando estiverem autenticados **/
    app.get('/me', { onRequest: [verifyJWT], schema: { tags: ['Users'], summary: 'Obter perfil autenticado', security: authenticated, response: { 200: { type: 'object', properties: { user: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' }, email: { type: 'string', format: 'email' }, role: { type: 'string', enum: ['ADMIN', 'MEMBER'] }, created_at: { type: 'string', format: 'date-time' } } } } }, 401: unauthorizedError } } }, profile)
    app.patch('/users', { onRequest: [verifyJWT], schema: { tags: ['Users'], summary: 'Atualizar senha do usuário autenticado', security: authenticated, body: { type: 'object', required: ['newPassword'], properties: { oldPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 6 } } }, response: { 204: { type: 'null' }, 400: validationError, 401: unauthorizedError, 404: { type: 'object', properties: { message: { type: 'string' } } } } } }, updatePassword)
    app.delete('/users', { onRequest: [verifyJWT], schema: { tags: ['Users'], summary: 'Excluir a própria conta', security: authenticated, response: { 204: { type: 'null' }, 401: unauthorizedError } } }, deleteUser)
}
