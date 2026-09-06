import { CheckIn } from "@prisma/client"
import { CheckInsRepository } from "../repositories/check-ins-repository";

interface FetchUserCheckInsHistoryUseCaseRequest {
    userId: string,
    page: number
}

interface FetchUserCheckInsHistoryUseCaseResponse {
    checkIn: CheckIn[]
}

export class FetchUserCheckInsHistoryUseCase {
    constructor(
        private checkInsRepository: CheckInsRepository,
    ) {}

    async execute({ 
        userId,
        page
    }: FetchUserCheckInsHistoryUseCaseRequest): Promise<FetchUserCheckInsHistoryUseCaseResponse> {

        const checkIn = await this.checkInsRepository.findManyByUserId(userId, page)


        return {
            checkIn
        }

    }

}
