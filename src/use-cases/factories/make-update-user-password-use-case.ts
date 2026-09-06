import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UpdateUserPasswordUseCase } from '../update-user-password'

export function makeUpdateUserPasswordUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const useCase = new UpdateUserPasswordUseCase(usersRepository)

    return useCase
}
