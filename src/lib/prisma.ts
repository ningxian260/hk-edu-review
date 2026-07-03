import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function hasUsableDatabaseUrl(value?: string) {
  return Boolean(value && !value.includes("[PROJECT-REF]") && !value.includes("[PRISMA-PASSWORD]") && !value.includes("[DB-REGION]"));
}

export const isDatabaseConfigured = hasUsableDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  (isDatabaseConfigured
    ? new PrismaClient({
        adapter: new PrismaPg(process.env.DATABASE_URL!),
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      })
    : (new Proxy(
        {},
        {
          get() {
            throw new Error("DATABASE_URL is required before using Prisma-backed features.");
          },
        },
      ) as PrismaClient));

if (process.env.NODE_ENV !== "production" && isDatabaseConfigured) {
  globalForPrisma.prisma = prisma;
}
