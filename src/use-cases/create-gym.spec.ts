import { expect, describe, it, beforeEach } from 'vitest'
import { compare } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { InMemoryGymRepository } from '../repositories/in-memory/in-memory-gyms-repository'
import { CreateGymUseCase } from './create-gym'
//import { beforeEach } from 'node:test'

/*test('check if it works', () => {
    expect(2 + 2).toBe(5)
})*/

let gymsRepository: InMemoryGymRepository
let sut: CreateGymUseCase

describe('Create Gym Use Case', () => {
    
    //executa uma função ou bloco de código antes de cada teste individual em uma suíte de testes
    beforeEach(() => {
        gymsRepository = new InMemoryGymRepository()
        sut = new CreateGymUseCase(gymsRepository)
    })
    
    
    it.skip('should be able to create gym', async () => {
        const { gym } = await sut.execute({
            title: 'JavaScript Gym',
            description: null,
            phone: null,
            latitude: -27.2092052,
            longitude: -49.6401091
        })

        expect(gym.id).toEqual(expect.any(String))
    })
    
    
})
 