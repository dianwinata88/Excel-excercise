import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // `prisma generate` does not connect to the database, but Prisma still
    // requires a syntactically valid URL when DATABASE_URL is absent (e.g.
    // Vercel preview builds before env vars are scoped to that environment).
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/excel_practice",
  },
});
