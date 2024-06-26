import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import express from "express";
import * as jwt from "jsonwebtoken";

import { db } from "@/db/drizzle";
import { authentications, users } from "@/db/drizzle/schema";

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

// // Protected route example
// authRouter.get("/profile", authenticateToken, async (req, res) => {
//   try {
//     const user = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, req.user.userId))
//       .single();

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
