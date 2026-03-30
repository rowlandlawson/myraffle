import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['error', 'warn'],
        datasourceUrl: process.env.DATABASE_URL
            ? `${process.env.DATABASE_URL}&connection_limit=10&pool_timeout=30`
            : undefined,
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
