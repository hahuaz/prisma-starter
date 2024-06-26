import { Express, Request, Response } from "express";

import { authRouter, userDetailsRouter, usersRouter } from "@/routes";

import { autheMiddleware } from "./middlewares";

/**
 * Setup the routes for the express app
 */
export const router = (app: Express) => {
  // Unprotected routes
  app
    .get("/api/ping", async (_req: Request, res: Response) => {
      res.json({ message: "pong" });
    })
    .use("/api/auth", authRouter);

  // Protected routes
  app
    .use("/api/users", autheMiddleware, usersRouter)
    .use("/api/user-details", autheMiddleware, userDetailsRouter);

  return app;
};
