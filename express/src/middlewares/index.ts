import { NextFunction, Request, Response } from "express";

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
