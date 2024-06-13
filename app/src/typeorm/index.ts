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

/**
 * Example of inserting a user
 */
export async function insertUser(): Promise<void> {
  const user = new User();
  user.firstName = "Timber";
  user.lastName = "Saw";
  user.age = 25;

  await useTypeORM(User).save(user);

  const users = await useTypeORM(User).find();
  console.log("Loaded users: ", users);
}
