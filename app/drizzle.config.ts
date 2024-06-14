import { defineConfig } from "drizzle-kit";

/**
 * Drizzle configuration file will be used to generate the database migration files via `npx drizzle-kit migrate` command.
 */
export default defineConfig({
  schema: "./src/db/drizzle/schema.ts",
  out: "./src/db/drizzle/migrations",
  dialect: "postgresql", // 'postgresql' | 'mysql' | 'sqlite'
});
