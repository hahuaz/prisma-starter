import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import config from "@/config";

import * as schema from "./schema";

const { DATABASE_URL } = config;

/**
 * Pg client instance
 */
export const pg = new Client({
  connectionString: DATABASE_URL,
});

/**
 * Drizzle client instance
 */
export const db = drizzle(pg, {
  schema,
});
