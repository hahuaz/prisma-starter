import express, { Request, Response } from "express";

import { httpLogMiddleware } from "@/middleware";
import { authRouter } from "@/routes/auth";
import { userDetailsRouter } from "@/routes/user-details";
import { usersRouter } from "@/routes/users";

export const apiRouter = express.Router();

apiRouter.use(httpLogMiddleware);
// parse application/x-www-form-urlencoded in api routes
apiRouter.use(express.urlencoded({ extended: true }));
// parse application/json in api routes
apiRouter.use(express.json());

apiRouter
  .get("/ping", async (_req: Request, res: Response, next) => {
    try {
      // throw new Error("This is an error");
      const resBody = {
        message: "pong",
      };
      res.json(resBody);
    } catch (error) {
      // call next with error to trigger error handling middleware
      next(error);
    }
  })
  .use("/auth", authRouter)
  .use("/users", usersRouter)
  .use("/user-details", userDetailsRouter);

export default apiRouter;
