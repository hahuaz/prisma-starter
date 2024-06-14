import "reflect-metadata";

import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";

import { User } from "./entity";

let typeORMDB: DataSource;

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

/**
 * Initialize TypeORM connection
 */
export async function typeORMConnect(): Promise<void> {
  const dataSource = new DataSource({
    type: "postgres",
    url: DATABASE_URL,
    entities: [User],
    migrations: [],
    subscribers: [],
    synchronize: true,
    // logging: false,
  });

  typeORMDB = await dataSource.initialize();
}

/**
 * Get TypeORM repository for an entity
 */
export function useTypeORM(
  entity: EntityTarget<ObjectLiteral>
): Repository<ObjectLiteral> {
  if (!typeORMDB) {
    throw new Error("TypeORM has not been initialized!");
  }

  return typeORMDB.getRepository(entity);
}
