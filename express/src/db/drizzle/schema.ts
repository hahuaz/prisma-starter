// schema file should only contain the schema definition since it is directly used by index.ts to generate the database schema.

import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const ROLES = ["admin", "editor", "viewer"] as const;

export const roleEnum = pgEnum("role", ROLES);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdateFn(() => new Date()),
  updateCounter: integer("update_counter")
    .default(sql`1`)
    .$onUpdateFn(() => sql`update_counter + 1`),
});

export const userDetails = pgTable("user_details", {
  id: serial("id").primaryKey(),
  // userDetails to users is one-to-one so unique constraint
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  birthDate: varchar("birth_date", { length: 256 }),
  address: varchar("address", { length: 512 }),
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdateFn(() => new Date()),
  updateCounter: integer("update_counter")
    .default(sql`1`)
    .$onUpdateFn(() => sql`update_counter + 1`),
});

/**
 * Reasons for saving the authentication token in the database even though using JWT:
 * 1. To revoke the token if needed
 * - If the user logs out, the token can be deleted from the database
 * - If the user changes their password, the token can be deleted from the database
 * - If the user's account is deleted, the token can be deleted from the database
 * - If the user's role is changed, the token can be deleted from the database
 * - If the user's account is locked, the token can be deleted from the database
 * 2. To keep track of the user's active sessions
 * 3. To keep track of the user's login history
 *
 */
export const authentications = pgTable("authentications", {
  id: serial("id").primaryKey(),
  // authentications to users is many-to-one so no unique constraint
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  token: varchar("token", { length: 512 }),
  expiresAt: varchar("expires_at", { length: 256 }),
  isRevoked: integer("is_revoked").default(sql`0`),
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
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
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
