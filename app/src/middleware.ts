import express, { Express } from "express";

const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Centralized middleware config for the express app
 */
export const middleware = (app: Express) => {
  // enable CORS for dev mode
  NODE_ENV === "development" &&
    app.use((_req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      next();
    });

  return (
    app
      // parse application/x-www-form-urlencoded body
      .use(express.urlencoded({ extended: true }))
      // parse application/json body
      .use(express.json())
  );
};
