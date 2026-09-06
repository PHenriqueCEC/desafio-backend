//Só posso ter aqui definição de tipos. Nada de const
import '@fastify/jwt'

import "@fastify/jwt"

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      sub: string,
      role: 'ADMIN' | 'MEMBER'
    }
  }
}
