import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  // Migrations + introspection: prefer DIRECT_URL (Supabase direct port 5432)
  // because PgBouncer pooler does not support DDL prepared statements.
  // Fallback to DATABASE_URL when DIRECT_URL is unset (dev local).
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
