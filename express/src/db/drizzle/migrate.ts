import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

import config from "@/config";

import { ROLES, roles } from "./schema";

const { DATABASE_URL } = config;

const connection = new Client({
  connectionString: DATABASE_URL,
});

export const db = drizzle(connection);

async function migrateDb() {
  try {
    await connection.connect();
    await migrate(db, {
      migrationsFolder: "./migrations",
    });

    // pre-populate roles table with default roles if not already present
    const valuesConfig = ROLES.map((role) => ({ name: role }));
    await db.insert(roles).values(valuesConfig).onConflictDoNothing();

    console.log("Migrations complete");
  } catch (error) {
    console.error("Error migrating the database", error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrateDb();
