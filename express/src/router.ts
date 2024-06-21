import { Express, Request, Response } from "express";

import { usersRouter } from "@/routes";

/**
 * Setup the routes for the express app
 */
export const router = (app: Express) => {
  return app
    .get("/", async (_req: Request, res: Response) => {
      res.json({ message: "The app is up and running" });
    })
    .use("/api/users", usersRouter);
};
