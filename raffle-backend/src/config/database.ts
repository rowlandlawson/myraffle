import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const DEFAULT_POOL_OPTIONS = {
    connection_limit: '10',
    pool_timeout: '30',
} as const;

const buildDatasourceUrl = (rawUrl?: string) => {
    if (!rawUrl) return undefined;

    try {
        const url = new URL(rawUrl);

        for (const [key, value] of Object.entries(DEFAULT_POOL_OPTIONS)) {
            if (!url.searchParams.has(key)) {
                url.searchParams.set(key, value);
            }
        }

        return url.toString();
    } catch {
        const params = new URLSearchParams(DEFAULT_POOL_OPTIONS);
        const separator = rawUrl.includes('?') ? '&' : '?';

        return `${rawUrl}${separator}${params.toString()}`;
    }
};

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['error', 'warn'],
        datasourceUrl: buildDatasourceUrl(process.env.DATABASE_URL),
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
