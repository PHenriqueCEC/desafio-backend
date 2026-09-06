import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UpdateUserPasswordUseCase } from './update-user-password'
import { hash, compare } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let usersRepository: InMemoryUsersRepository
let sut: UpdateUserPasswordUseCase

describe('Update User Password Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new UpdateUserPasswordUseCase(usersRepository)
    })

    it('should be able to update user password with correct old password', async () => {
        const createdUser = await usersRepository.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password_hash: await hash('123456', 6),
        })

        const { user } = await sut.execute({
            userId: createdUser.id,
            oldPassword: '123456',
            newPassword: '654321',
        })

        expect(user.id).toEqual(createdUser.id)
        const isPasswordUpdated = await compare('654321', user.password_hash)
        expect(isPasswordUpdated).toBe(true)
    })

    it('should not be able to update password with wrong old password', async () => {
        const createdUser = await usersRepository.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password_hash: await hash('123456', 6),
        })

        await expect(() =>
            sut.execute({
                userId: createdUser.id,
                oldPassword: 'wrong-password',
                newPassword: '654321',
            }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError)
    })

    it('should not be able to update password of non-existing user', async () => {
        await expect(() =>
            sut.execute({
                userId: 'non-existing-id',
                oldPassword: '123456',
                newPassword: '654321',
            }),
        ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
})
