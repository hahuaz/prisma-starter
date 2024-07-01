import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import express from "express";
import * as jwt from "jsonwebtoken";

import config from "@/config";
import { db } from "@/db/drizzle";
import { authentications, userRoles, users } from "@/db/drizzle/schema";
import { authnMiddleware } from "@/middleware";

const { EXPRESS_SECRET, TOKEN_EXPIRATION } = config;

export const authRouter = express.Router();

// Login route
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Get user role from join table
    const [userRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const token = jwt.sign(
      { userId: user.id, roleId: userRole.roleId },
      EXPRESS_SECRET,
      {
        expiresIn: TOKEN_EXPIRATION,
      }
    );

    await db.insert(authentications).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout route
authRouter.post("/logout", authnMiddleware, async (req, res) => {
  let {
    jwtPayload: { userId },
    token,
  } = res.locals;

  try {
    token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, EXPRESS_SECRET) as {
      userId: number;
    };
    userId = decodedToken.userId;
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const { rowCount } = await db
      .update(authentications)
      .set({
        isRevoked: 1,
      })
      .where(
        and(
          eq(authentications.userId, userId),
          eq(authentications.token, token)
        )
      );

    if (rowCount === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
