import { CreateGymUseCase } from "../create-gym"
import { PrismaGymsRespository } from "@/repositories/prisma/prisma-gyms-repository"

export function makeCreateGymUseCase() {
    const gymsRepository = new PrismaGymsRespository
    const useCase = new CreateGymUseCase(gymsRepository)

    return useCase
}