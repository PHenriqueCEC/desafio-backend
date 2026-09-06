import { expect, test, describe, it, beforeEach } from 'vitest'
import { compare } from 'bcryptjs'
import { PrismaUsersRepository } from '../repositories/prisma/prisma-users-repository'
import { RegisterUseCase } from './register'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
//import { beforeEach } from 'node:test'

/*test('check if it works', () => {
    expect(2 + 2).toBe(5)
})*/

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
    
    //executa uma função ou bloco de código antes de cada teste individual em uma suíte de testes
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new RegisterUseCase(usersRepository)
    })
    
    
    it.skip('should be able to register', async () => {
        const { user } = await sut.execute({
            name: 'John Doe',
            email: "johndoe@example.com",
            password: "123456"
        })

        expect(user.id).toEqual(expect.any(String))
    })
    
    it('should hash user password upon registration', async () => {
        //Repositório fake aqui dentro da estrutura de teste para que o deploy seja mais rápido, não precise fazer conexão com o BD

        const { user } = await sut.execute({
            name: 'John Doe',
            email: "johndoe@example.com",
            password: "123456"
        })

        const isPasswordCorrectlyHashed =  await compare(
            '123456',
            user.password_hash,
        )

        expect(isPasswordCorrectlyHashed).toBe(true)
    })

it('should not be able to register with same email twice', async () => {
        const email = "johndoe@example.com"

        await sut.execute({
            name: 'John Doe',
            email,
            password: "123456"
        })

        await expect(() => 
        sut.execute({
            name: 'John Doe',
            email,
            password: "123456"
        })
        ).rejects.toBeInstanceOf(UserAlreadyExistsError) 
    })
})
 