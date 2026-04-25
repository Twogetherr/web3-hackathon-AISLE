import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

/**
 * Creates or reuses the shared Prisma client instance.
 *
 * @returns The Prisma client singleton for database access.
 * @throws Never.
 */
export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma === undefined) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}
