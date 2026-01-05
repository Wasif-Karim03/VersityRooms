import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client with connection pooling configuration
 * Optimized for 500+ daily active users
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    
    // Connection pool configuration for production
    // Connection pool settings are configured via DATABASE_URL query params
    // Example: postgresql://user:pass@host/db?connection_limit=20&pool_timeout=10
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
}

