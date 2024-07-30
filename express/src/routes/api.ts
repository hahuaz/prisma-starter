import express, { Request, Response } from "express";

import { formatHTTPLoggerData, httpLogger } from "@/lib";
import { authRouter } from "@/routes/auth";
import { userDetailsRouter } from "@/routes/user-details";
import { usersRouter } from "@/routes/users";

export const apiRouter = express.Router();

// parse application/x-www-form-urlencoded in api routes
apiRouter.use(express.urlencoded({ extended: true }));
// parse application/json in api routes
apiRouter.use(express.json());

apiRouter
  .get("/ping", async (req: Request, res: Response) => {
    const resBody = { message: "pong" };
    res.json(resBody);
    httpLogger.info("success", formatHTTPLoggerData(req, res, resBody));
  })
  .use("/auth", authRouter)
  .use("/users", usersRouter)
  .use("/user-details", userDetailsRouter);

export default apiRouter;
