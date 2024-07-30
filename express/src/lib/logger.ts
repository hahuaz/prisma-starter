import { randomBytes } from "crypto";
import express, { NextFunction, Request, Response } from "express";
import winston from "winston";

import config from "@/config";

const { NODE_ENV, APP_VERSION } = config;

const generateLogId = (): string => randomBytes(16).toString("hex");

const { combine, timestamp, json, printf } = winston.format;
const timestampFormat = "MMM-DD-YYYY HH:mm:ss";

/**
 * Logger for HTTP requests and responses
 */
export const httpLogger = winston.createLogger({
  format: combine(
    timestamp({ format: timestampFormat }),
    json(),
    printf(({ timestamp, level, message, ...data }) => {
      const response = {
        level,
        message,
        data,
        logId: generateLogId(),
        appInfo: {
          APP_VERSION,
          NODE_ENV,
          proccessId: process.pid,
        },
        timestamp: timestamp as string,
      };

      return JSON.stringify(response);
    })
  ),
  transports: [new winston.transports.Console()],
});

/**
 * Format the HTTP request and response data for logging
 */
export const formatHTTPLoggerData = ({
  req,
  res,
  resBody,
  error,
}: {
  req: express.Request;
  res: express.Response;
  resBody?: unknown;
  error?: Error;
}) => {
  return {
    request: {
      headers: req.headers,
      host: req.headers.host,
      baseUrl: req.baseUrl,
      url: req.url,
      method: req.method,
      body: req.body as unknown,
      params: req.params,
      query: req.query,
      clientIp: req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
    },
    response: {
      headers: res.getHeaders(),
      statusCode: res.statusCode,
      body: resBody,
    },
    error: error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined,
  };
};

/**
 * Middleware to log the HTTP request and response
 * It should be used before any other middleware or route
 */
export const httpLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;
  let isResponseSent = false;

  res.send = function (resBody) {
    if (!isResponseSent) {
      if (res.statusCode < 400) {
        httpLogger.info("success", formatHTTPLoggerData({ req, res, resBody }));
      } else {
        httpLogger.error(
          "error",
          formatHTTPLoggerData({
            req,
            res,
            resBody,
            error: res.locals.error as Error,
          })
        );
      }
      isResponseSent = true;
    } else {
      console.warn(
        "Response is already sent, cannot log the response data again"
      );
    }

    return originalSend.call(this, resBody);
  };

  next();
};
