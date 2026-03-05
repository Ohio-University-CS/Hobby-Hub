import { PrismaClient as GeneratedPrismaClient } from "@/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma?: GeneratedPrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new GeneratedPrismaClient({} as ConstructorParameters<typeof GeneratedPrismaClient>[0])

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;