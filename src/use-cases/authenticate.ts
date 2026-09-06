import { User } from "@prisma/client";
import { compare } from 'bcryptjs'
import { UsersRepository } from "../repositories/users-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";

interface AuthenticateCaseRequest {
    email: string,
    password: string
}

interface AuthenticateCaseResponse {
    user: User
}

export class AuthenticateUseCase {
    constructor(
        private usersRepository: UsersRepository,
    ) {}

    async execute({ 
        email, 
        password 
    }: AuthenticateCaseRequest): Promise<AuthenticateCaseResponse> {
        const user = await this.usersRepository.findByEmail(email)

        if(!user) {
            throw new InvalidCredentialsError()
        }

        const doesPasswordMatches = await compare(password, user.password_hash)

        if(!doesPasswordMatches) {
            throw new InvalidCredentialsError()
        }

        return {
            user
        }
    }
}
