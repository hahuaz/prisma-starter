import express, { Request, Response } from "express";
import winston from "winston";

import config from "@/config";
import { generateRandomHex } from "@/lib";

const { NODE_ENV, APP_VERSION } = config;

const { combine, timestamp, json, printf } = winston.format;
const timestampFormat = "MMM-DD-YYYY HH:mm:ss";

class HTTPLogger {
  private static instance: HTTPLogger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      format: combine(
        timestamp({ format: timestampFormat }),
        json(),
        printf(({ timestamp, level, message, ...data }) => {
          const response = {
            level,
            message,
            data,
            logId: generateRandomHex(),
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
  }

  formatHTTPLoggerData({
    req,
    res,
    resBody,
    error,
  }: {
    req: express.Request;
    res: express.Response;
    resBody?: unknown;
    error?: Error;
  }) {
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
  }

  info({
    req,
    res,
    resBody,
  }: {
    req: Request;
    res: Response;
    resBody: unknown;
  }) {
    this.logger.info(
      "success",
      this.formatHTTPLoggerData({ req, res, resBody })
    );
  }

  error({
    req,
    res,
    resBody,
    error,
  }: {
    req: Request;
    res: Response;
    resBody: unknown;
    error: Error;
  }) {
    this.logger.error(
      "error",
      this.formatHTTPLoggerData({ req, res, resBody, error })
    );
  }

  // force singleton by marking constructor as private
  public static init(): HTTPLogger {
    if (!this.instance) {
      this.instance = new HTTPLogger();
    }
    return HTTPLogger.instance;
  }
}

export const httpLogger = HTTPLogger.init();
