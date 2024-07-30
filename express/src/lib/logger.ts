import express, { Request, Response } from "express";
import winston from "winston";

import config from "@/config";
import { generateRandomHex } from "@/lib";

const {
  NODE_ENV,
  APP_VERSION,
  FORMAT: { TIME_FORMAT },
} = config;

const { combine, timestamp, json, printf } = winston.format;

import { redact } from "@/lib";
import { AnyObj } from "@/types";

class HTTPLogger {
  private static instance: HTTPLogger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      format: combine(
        timestamp({ format: TIME_FORMAT }),
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

  /**
   * Redact sensitive data from the log by looping through the object or array
   */
  redactSensitiveData(data: AnyObj | AnyObj[] | string) {
    const redactEnums = [
      "password",
      "oldPassword",
      "newPassword",
      "repeatPassword",
      "token",
      "refreshToken",
      "authorization",
    ];

    const redactedData = redact({
      data,
      redactEnums,
    });

    return redactedData;
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
        body: this.redactSensitiveData(req.body as AnyObj),
        params: req.params,
        query: req.query,
        clientIp: req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
      },
      response: {
        headers: res.getHeaders(),
        // duration in seconds
        duration: (Date.now() - res.locals.reqStartTime) / 1000,
        statusCode: res.statusCode,
        body: this.redactSensitiveData(resBody as AnyObj),
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

  info(payload: { req: Request; res: Response; resBody: unknown }) {
    this.logger.info("success", this.formatHTTPLoggerData(payload));
  }

  error(payload: {
    req: Request;
    res: Response;
    resBody: unknown;
    error: Error;
  }) {
    this.logger.error("error", this.formatHTTPLoggerData(payload));
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
