import { FastifyRequest, FastifyReply } from 'fastify'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeDeleteUserUseCase } from '@/use-cases/factories/make-delete-user-use-case'

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    try {
        const deleteUserUseCase = makeDeleteUserUseCase()

        await deleteUserUseCase.execute({
            userId: request.user.sub,
        })
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: err.message })
        }

        throw err
    }

    return reply.status(204).send()
}
