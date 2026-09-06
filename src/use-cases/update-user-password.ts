import { compare, hash } from 'bcryptjs'
import { User } from '@prisma/client'
import { UsersRepository } from '../repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

interface UpdateUserPasswordUseCaseRequest {
    userId: string
    oldPassword?: string
    newPassword: string
}

interface UpdateUserPasswordUseCaseResponse {
    user: User
}

export class UpdateUserPasswordUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute({
        userId,
        oldPassword,
        newPassword,
    }: UpdateUserPasswordUseCaseRequest): Promise<UpdateUserPasswordUseCaseResponse> {
        const user = await this.usersRepository.findById(userId)

        if (!user) {
            throw new ResourceNotFoundError()
        }

        if (oldPassword) {
            const doesPasswordMatch = await compare(oldPassword, user.password_hash)

            if (!doesPasswordMatch) {
                throw new InvalidCredentialsError()
            }
        }

        const password_hash = await hash(newPassword, 6)

        const updatedUser = await this.usersRepository.updatePassword(userId, password_hash)

        return {
            user: updatedUser,
        }
    }
}
