import express, { Express } from "express";

/**
 * Centralized middleware config for the express app
 */
const middleware = (app: Express) => {
  return (
    app
      // parse application/x-www-form-urlencoded body
      .use(express.urlencoded({ extended: true }))
      // parse application/json body
      .use(express.json())
  );
};

export default middleware;
