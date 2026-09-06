import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeUpdateUserPasswordUseCase } from '@/use-cases/factories/make-update-user-password-use-case'

export async function updatePassword(request: FastifyRequest, reply: FastifyReply) {
    const updatePasswordBodySchema = z.object({
        oldPassword: z.string().optional(),
        newPassword: z.string().min(6),
    })

    const { oldPassword, newPassword } = updatePasswordBodySchema.parse(request.body)

    try {
        const updateUserPasswordUseCase = makeUpdateUserPasswordUseCase()

        await updateUserPasswordUseCase.execute({
            userId: request.user.sub,
            oldPassword,
            newPassword,
        })
    } catch (err) {
        if (err instanceof ResourceNotFoundError) {
            return reply.status(404).send({ message: err.message })
        }

        if (err instanceof InvalidCredentialsError) {
            return reply.status(400).send({ message: err.message })
        }

        throw err
    }

    return reply.status(204).send()
}
