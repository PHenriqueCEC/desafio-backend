import 'dotenv/config'
import { execSync } from 'node:child_process'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'node:crypto'
import type { Environment } from 'vitest/environments'

function generateDatabaseUrl(schema: string) {
    if(!process.env.DATABASE_URL) {
        throw new Error('Please provide a DATABASE_URL env variable')
    }

    const url = new URL(process.env.DATABASE_URL)

    url.searchParams.set('schema', schema)

    return url.toString()
}

export default <Environment> {
    name: 'prisma',
    transformMode: 'ssr',
    async setup() {
        // 1 Criar o banco de teste
        const schema = randomUUID()
        const databaseUrl = generateDatabaseUrl(schema)

        process.env.DATABASE_URL = databaseUrl

        execSync('npx prisma migrate deploy') //Executa como se fosse no terminal

        return {
            async teardown() {
                //2 Apagar o banco de teste
               await prisma.$executeRawUnsafe(
                `DROP SCHEMA IF EXISTS "${schema}" CASCADE` 
               ) 

               await prisma.$disconnect()
            }
        }
    }
}