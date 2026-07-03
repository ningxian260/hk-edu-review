import "dotenv/config";
import { defineConfig } from "prisma/config";

const prismaGenerateFallbackUrl = "postgresql://prisma:prisma@localhost:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || prismaGenerateFallbackUrl,
  },
});
