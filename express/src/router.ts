import express, { Express, Request, Response } from "express";

import { authRouter, userDetailsRouter, usersRouter } from "@/routes";

import { autheMiddleware, corsMiddleware } from "./middleware";

const apiRouter = express.Router();

// parse application/x-www-form-urlencoded in api routes
apiRouter.use(express.urlencoded({ extended: true }));
// parse application/json in api routes
apiRouter.use(express.json());
apiRouter.use(corsMiddleware);

// Unprotected routes
apiRouter
  .get("/ping", async (_req: Request, res: Response) => {
    res.json({ message: "pong" });
  })
  .use("/auth", authRouter);

// Protected routes
apiRouter.use(autheMiddleware);
apiRouter.use("/users", usersRouter).use("/user-details", userDetailsRouter);

/**
 * Setup the routes for the express app
 */
export const setupRouter = (app: Express) => {
  app.use("/api", apiRouter);

  return app;
};
