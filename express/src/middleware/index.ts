import { eq } from "drizzle-orm";
import express, { Express, NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

import { db } from "@/db/drizzle";
import { authentications, userRoles, users } from "@/db/drizzle/schema";

const { EXPRESS_SECRET: JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set");
  process.exit(1);
}

/**
 * Middleware to parse and attach orderBy query params to request object
 */
export function orderByMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // let client to decide the order of the results
  const { orderBy } = req.query;

  // only one order by is allowed
  const orderByArray = orderBy?.[0]?.split(","); // = ["createdAt", "desc"]
  res.locals.orderByColumn = orderByArray?.[0] || "createdAt"; // "createdAt"
  res.locals.orderByDirection = orderByArray?.[1] || "desc"; // "desc"

  next();
}

/**
 * Middleware to authenticate the user
 */
export const autheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  let tokenVerifyPayload;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }

  try {
    tokenVerifyPayload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }

  try {
    const [auth] = await db
      .select()
      .from(authentications)
      .where(eq(authentications.token, token));

    if (!auth) {
      console.log("No auth found after token verification", req);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("tokenVerifyPayload", tokenVerifyPayload);
    res.locals.user = tokenVerifyPayload.userId;

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Middleware to authorize the user
 *
 * This middleware checks if the user has the required role to access the resource
 */
export const authoMiddleware = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = res.locals;

  try {
    const [userRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user));

    // TODO: Check if the user has the required role to access the resource

    if (!userRole) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Middleware to enable CORS for development mode
 */
export const corsMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV !== "development") {
    return next();
  }

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
};
