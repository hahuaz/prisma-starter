import { Express, Request, Response } from "express";

import { userDetailsRouter, usersRouter } from "@/routes";

/**
 * Setup the routes for the express app
 */
export const router = (app: Express) => {
  return app
    .get("/ping", async (_req: Request, res: Response) => {
      res.json({ message: "pong" });
    })
    .use("/api/users", usersRouter)
    .use("/api/user-details", userDetailsRouter);
};
