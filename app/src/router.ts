import { Express, Request, Response } from "express";

import {
  organizationRouter,
  personRouter,
  serviceRouter,
  skillRouter,
} from "@/routes";

/**
 * Setup the routes for the express app
 */
const router = (app: Express) => {
  return app
    .get("/", async (req: Request, res: Response) => {
      res.json({ message: "App is up and running" });
    })
    .use("/services", serviceRouter)
    .use("/organizations", organizationRouter)
    .use("/skills", skillRouter)
    .use("/persons", personRouter);
};

export default router;
