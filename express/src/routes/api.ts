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
    try {
      // throw new Error("This is an error");
      const resBody = { message: "pong" };
      res.json(resBody);
      httpLogger.info("success", formatHTTPLoggerData({ req, res, resBody }));
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
      httpLogger.error(
        "error",
        formatHTTPLoggerData({ req, res, error: error as Error })
      );
    }
  })
  .use("/auth", authRouter)
  .use("/users", usersRouter)
  .use("/user-details", userDetailsRouter);

export default apiRouter;
