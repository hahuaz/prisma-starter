import express, { Request, Response } from "express";

import { corsMiddleware } from "@/middleware";
import { authRouter } from "@/routes/auth";
import { userDetailsRouter } from "@/routes/user-details";
import { usersRouter } from "@/routes/users";

export const apiRouter = express.Router();

// parse application/x-www-form-urlencoded in api routes
apiRouter.use(express.urlencoded({ extended: true }));
// parse application/json in api routes
apiRouter.use(express.json());
apiRouter.use(corsMiddleware);

apiRouter
  .get("/ping", async (_req: Request, res: Response) => {
    res.json({ message: "pong" });
  })
  .use("/auth", authRouter)
  .use("/users", usersRouter)
  .use("/user-details", userDetailsRouter);

export default apiRouter;
