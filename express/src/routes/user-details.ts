import { desc, eq } from "drizzle-orm";
import express from "express";

import { db } from "@/db/drizzle";
import { userDetails, users } from "@/db/drizzle/schema";
import { authnMiddleware, orderByMiddleware } from "@/middleware";

export const userDetailsRouter = express.Router();

// Create new user details
userDetailsRouter.post("/", authnMiddleware, async (req, res) => {
  const { userId, fullName, birthDate, address } = req.body;

  const intUserId = parseInt(userId, 10);

  try {
    // Check if userId exists in the users table
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, intUserId));

    if (userExists.length === 0) {
      return res.status(400).json({ error: "User ID does not exist" });
    }

    const newUserDetails = await db
      .insert(userDetails)
      .values({ userId, fullName, birthDate, address })
      .returning();
    res.status(201).json(newUserDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details by ID
userDetailsRouter.get("/:id", authnMiddleware, async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);

  try {
    const details = await db
      .select()
      .from(userDetails)
      .where(eq(userDetails.id, intId))
      // you can use left table data(userDetails) in the join condition
      .leftJoin(users, eq(users.id, userDetails.userId));

    console.log(details);
    if (details.length > 0) {
      res.status(200).json(details[0]);
    } else {
      res.status(404).json({ error: "User details not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user details by ID
userDetailsRouter.patch("/:id", authnMiddleware, async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);
  const { fullName, birthDate, address } = req.body;
  try {
    // drizzle won't update the column for the undefined values
    const updatedDetails = await db
      .update(userDetails)
      .set({ fullName, birthDate, address })
      .where(eq(userDetails.id, intId))
      .returning();
    res.status(200).json(updatedDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user details by ID
userDetailsRouter.delete("/:id", authnMiddleware, async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);
  try {
    await db.delete(userDetails).where(eq(userDetails.id, intId));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all user details
userDetailsRouter.get(
  "/",
  authnMiddleware,
  orderByMiddleware,
  async (_req, res) => {
    const { orderByColumn, orderByDirection } = res.locals;

    const orderByCb =
      orderByDirection === "desc"
        ? desc(userDetails[orderByColumn])
        : userDetails[orderByColumn];

    try {
      const allDetails = await db.select().from(userDetails).orderBy(orderByCb);

      res.status(200).json(allDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
