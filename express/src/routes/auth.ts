import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import express from "express";
import * as jwt from "jsonwebtoken";

import { db } from "@/db/drizzle";
import { authentications, users } from "@/db/drizzle/schema";
import { autheMiddleware } from "@/middleware";

export const authRouter = express.Router();

const { EXPRESS_SECRET: JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set");
  process.exit(1);
}
const TOKEN_EXPIRATION = "1h"; // Token expiration time

// Login route
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user, _] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

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
authRouter.post("/logout", autheMiddleware, async (req, res) => {
  let {
    tokenVerifyPayload: { userId },
    token,
  } = res.locals;

  try {
    token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: number };
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
