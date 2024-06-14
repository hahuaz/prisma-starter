import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

/**
 * Pg client instance
 */
export const client = new Client({
  connectionString: DATABASE_URL,
});

/**
 * Drizzle instance
 */
export const db = drizzle(client);

export async function connectDrizzle() {
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database", error);
    throw error;
  }
}
