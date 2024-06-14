import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

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
    console.log("Migrations complete");
  } catch (error) {
    console.error("Error migrating the database", error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrateDb();
