import { User, Prisma } from "@prisma/client";
import { UsersRepository } from "../users-repository";
import { randomUUID } from "node:crypto";

export class InMemoryUsersRepository implements UsersRepository {

    public items: User[] = []

    async findById(id: string) {
        const user = this.items.find(item => item.id === id)

        if (!user) {
            return null
        }

        return user
    }
    async findByEmail(email: string) {
        const user = this.items.find(item => item.email === email)

        if (!user) {
            return null
        }

        return user
    }
    async create(data: Prisma.UserCreateInput) {
        const user = {
            id: randomUUID(),
            name: data.name,
            email: data.email,
            password_hash: data.password_hash,
            created_at: new Date()
        }

        this.items.push(user)

        return user
    }

    async updatePassword(id: string, password_hash: string) {
        const userIndex = this.items.findIndex(item => item.id === id)

        if (userIndex === -1) {
            throw new Error('User not found.')
        }

        this.items[userIndex].password_hash = password_hash

        return this.items[userIndex]
    }

    async delete(id: string) {
        const userIndex = this.items.findIndex(item => item.id === id)

        if (userIndex !== -1) {
            this.items.splice(userIndex, 1)
        }
    }
}
