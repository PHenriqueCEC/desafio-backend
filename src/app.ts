import fastify from "fastify";
import { ZodError } from "zod";
import { env } from './env'
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { usersRoutes } from "./http/controllers/users/routes";
import { gymsRoutes } from "./http/controllers/gyms/routes";
import { checkInsRoutes } from "./http/controllers/check-ins/routes";
import { swaggerOptions, swaggerUiOptions } from './http/swagger'

export const app = fastify({
  ajv: {
    customOptions: {
      // `example` é metadata do OpenAPI e não uma regra de validação do AJV.
      strict: false,
    },
  },
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
})

app.register(fastifyCookie)

// O Swagger deve estar na instância raiz antes das rotas para descobri-las.
app.register(swagger, swaggerOptions)
app.register(usersRoutes)
app.register(gymsRoutes)
app.register(checkInsRoutes)
// A interface é registrada depois que todas as rotas já foram declaradas.
app.register(swaggerUi, swaggerUiOptions)

app.setErrorHandler((error, request, reply) => {
    if(error instanceof ZodError) {
        return reply
        .status(400)
        .send({ message: 'Validation error.', issues: error.format() })
    }

    if(env.NODE_ENV !== 'production') {
        console.error(error)
    } else {
        //Deveriamos fazer log para uma ferramenta externa tipo dataGog, NewRelic,Sentry
    }

    return reply.status(500).send({ message: 'Internal server error.' })
})
