import bcrypt from "bcrypt";
import { desc, eq } from "drizzle-orm";
import express from "express";

import { db } from "@/db/drizzle";
import { userDetails, users } from "@/db/drizzle/schema";
import { orderByMiddleware } from "@/middleware";
import { autheMiddleware } from "@/middleware";

export const usersRouter = express.Router();

// Create a new user
usersRouter.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  // TODO salt
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const newUser = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .returning();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single user by ID along with user details
usersRouter.get("/:id", autheMiddleware, async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);

  try {
    // drizzle will return name mapped results from driver without changing the structure such as {users:..., user_details:...}
    const userWithDetails = await db
      .select()
      .from(users)
      .where(eq(users.id, intId))
      // you can use left table data(users) in the join condition
      .leftJoin(userDetails, eq(userDetails.userId, users.id));

    if (userWithDetails[0]) {
      const { fullName, address, birthDate } = userWithDetails[0].user_details;

      const resData = {
        ...userWithDetails[0].users,
        userDetails: { fullName, address, birthDate },
      };

      res.status(200).json(resData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID
usersRouter.patch("/:id", autheMiddleware, async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);
  const { username, email, passwordHash } = req.body;
  try {
    const updatedUser = await db
      .update(users)
      .set({ username, email, passwordHash })
      .where(eq(users.id, intId))
      .returning();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
usersRouter.delete("/:id", autheMiddleware, async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);
  try {
    await db.delete(users).where(eq(users.id, intId));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
usersRouter.get("/", autheMiddleware, orderByMiddleware, async (_req, res) => {
  const { orderByColumn, orderByDirection } = res.locals;

  const orderByCb =
    orderByDirection === "desc"
      ? desc(users[orderByColumn])
      : users[orderByColumn];

  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(orderByCb);

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
