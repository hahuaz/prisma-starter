// schema file should only contain the schema definition since it is directly used by index.ts to generate the database schema.

import {
  integer,
  pgEnum,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "editor", "viewer"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
});

export const userDetails = pgTable("user_details", {
  id: serial("id").primaryKey(),
  // userDetails to users is one-to-one so unique constraint
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  birthDate: varchar("birth_date", { length: 256 }),
  address: varchar("address", { length: 512 }),
});

export const authentications = pgTable("authentications", {
  id: serial("id").primaryKey(),
  // authentications to users is many-to-one so no unique constraint
  userId: integer("user_id").references(() => users.id),
  token: varchar("token", { length: 512 }),
  expiresAt: varchar("expires_at", { length: 256 }),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  roleName: roleEnum("role").notNull().unique(),
});

// JOIN TABLES

export const userRoles = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
  },
  (userRoles) => {
    return {
      // Creating a unique index on user_id and role_id
      userIdRoleIdIndex: uniqueIndex("user_id_role_id_idx").on(
        userRoles.userId,
        userRoles.roleId
      ),
    };
  }
);
