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
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id), // Ensures unique and foreign key constraint
  fullName: varchar("full_name", { length: 256 }).notNull(),
  birthDate: varchar("birth_date", { length: 256 }),
  address: varchar("address", { length: 512 }),
});

export const authentications = pgTable("authentications", {
  id: serial("id").primaryKey(),
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

// one-to-one relationships: one table should reference the id of another table only once.
// Example: users to userDetails is a one-to-one relationship table: because one user can have only one set of details:

// users table:
// +---+---------+----------------+----------------+
// | id| username| email          | password_hash  |
// +---+---------+----------------+----------------+
// | 0 | user1   | -              | -              |
// | 1 | user2   | -              | -              |
// +---+---------+----------------+----------------+

// userDetails table:
// +---+---------+----------------+----------------+----------------+
// | id| user_id | full_name      | birth_date     | address        |
// +---+---------+----------------+----------------+----------------+
// | 0 | 0       | -              | -              | -              |
// | 1 | 1       | -              | -              | -              |
// +---+---------+----------------+----------------+----------------+
// as seen above, the key is used only once in the user_id column thus creating a one-to-one relationship

//////////////////////////////////////////

// one-to-many relationships: one table should reference the id of another table multiple times.
// Example: user to authentications is a one-to-many relationship table: because one user can login from multiple devices and have multiple tokens:

// users table:
// +---+---------+----------------+----------------+
// | id| username| email          | password_hash  |
// +---+---------+----------------+----------------+
// | 0 | user1   | -              | -              |
// | 1 | user2   | -              | -              |
// +---+---------+----------------+----------------+

// authentications table:
// +---+---------+----------------+----------------+
// | id| user_id | token          | expires_at     |
// +---+---------+----------------+----------------+
// | 0 | 1       | -              | -              |
// | 1 | 1       | -              | -              |
// | 2 | 2       | -              | -              |
// +---+---------+----------------+----------------+
// as seen above, the same key is used multiple times in the same column thus creating a one-to-many relationship

//////////////////////////////////////////

// many-to-many relationships: for many-to-many relationships, we need to create a join table.
// Example: users to roles is a many-to-many relationship: because one user can have multiple roles and one role can be assigned to multiple users:

// userRoles table:
// +---+---------+--------+
//  id | user_id | role_id|
// +---+---------+--------+
// | 0 |     1   |     1  |
// | 1 |     1   |     2  |
// | 2 |     2   |     1  |
// | 3 |     2   |     3  |
// +---+---------+--------+
// as seen above, the same key is used multiple times in the same column thus creating a many-to-many relationship
