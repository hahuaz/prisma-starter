import { and, eq } from "drizzle-orm";
import express, { Express, NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

import config from "@/config";
import { db } from "@/db/drizzle";
import { authentications, roles, userRoles, users } from "@/db/drizzle/schema";
import { httpLogger } from "@/lib";
import { normalizePath } from "@/lib";

const { EXPRESS_SECRET, IS_DEV } = config;

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
export const authnMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  let jwtPayload;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }

  try {
    jwtPayload = jwt.verify(token, EXPRESS_SECRET);
    if (typeof jwtPayload !== "object") throw new Error("Invalid token");
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const [auth] = await db
      .select()
      .from(authentications)
      .where(
        and(eq(authentications.token, token), eq(authentications.isRevoked, 0))
      );

    if (!auth) {
      console.log("No auth record found after token verification");
      return res.status(401).json({ error: "Invalid token" });
    }

    res.locals.jwtPayload = jwtPayload;
    res.locals.token = token;

    next();
  } catch (error) {
    res.status(500).json({ error: error.message as string });
  }
};

const RESOURCE_ROLE_ACCESSS_MAP = {
  "/api/users": ["admin"],
  "/api/user-details": ["admin"],
};

/**
 * Middleware to authorize the user
 *
 * This middleware checks if the user has the required role to access the resource
 */
export const authzMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { jwtPayload } = res.locals;
  const { _userId, roleId } = jwtPayload || {};

  const fullPath = normalizePath(req.baseUrl + req.path);
  const requiredRoles = RESOURCE_ROLE_ACCESSS_MAP[fullPath];

  try {
    const [userRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId));

    if (!requiredRoles?.includes(userRole.name)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // TODO: for now, allow implicit access to all unmapped routes
    next();
  } catch (error) {
    res.status(500).json({ error: error.message as string });
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
  if (!IS_DEV) return next();

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
};

/**
 * It handles any errors that occur during the request/response cycle.
 * It must be the last middleware added to the app.
 * When an error is passed to the `next` function, it will be caught and passed to this middleware.
 */
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // TODO: you can get status code from error object instead of always using 500

  // pass error to locals so logger middleware can access it
  res.locals.error = err;
  const resPayload: { errorMessage: string; stack?: string } = {
    errorMessage: err.message,
  };

  IS_DEV && (resPayload.stack = err.stack);

  res.status(500).json(resPayload);
};

/**
 * Middleware to log the HTTP request and response.
 * It should be used before any other middleware or route.
 * Currently it can only log api route calls since it relies on the res.send method.
 */
export const httpLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.reqStartTime = Date.now();
  const originalSend = res.send;
  let isResponseSent = false;

  res.send = function (resBody) {
    if (!isResponseSent) {
      if (res.statusCode < 400) {
        httpLogger.info({ req, res, resBody });
      } else {
        httpLogger.error({
          req,
          res,
          resBody,
          error: res.locals.error as Error,
        });
      }
      isResponseSent = true;
    } else {
      console.warn(
        "Response is already sent, cannot log the response data again"
      );
    }

    // pass this, response object, to the original send method because it's internally used by express
    return originalSend.call(this, resBody);
  };

  next();
};
