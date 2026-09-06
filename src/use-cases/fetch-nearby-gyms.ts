import { Gym } from '@prisma/client'
import { GymsRepository } from "../repositories/gyms-repository"

interface FetchNearbyGymUseCaseRequest {
    userLatitude: number
    userLongitude: number
}

//SOLID 

// D - Dependency Inversion Principle

interface FetchNearbyGymUseCaseResponse {
    gyms: Gym[]
}

export class FetchNearbyGymUseCase {
    constructor(private gymRepository: GymsRepository) {}
            
    async execute ({ userLatitude, userLongitude }: FetchNearbyGymUseCaseRequest): Promise<FetchNearbyGymUseCaseResponse> {

        const gyms = await this.gymRepository.findManyNearby({latitude: userLatitude, longitude: userLongitude})
        

        return {
            gyms
        }

    }
}
