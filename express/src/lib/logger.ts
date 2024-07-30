import express from "express";
import winston from "winston";

const { combine, timestamp, json, printf } = winston.format;
const timestampFormat = "MMM-DD-YYYY HH:mm:ss";

export const httpLogger = winston.createLogger({
  format: combine(
    timestamp({ format: timestampFormat }),
    json(),
    printf(({ timestamp, level, message, ...data }) => {
      const response = {
        level,
        message,
        data,
        timestamp,
      };

      return JSON.stringify(response);
    })
  ),
  transports: [new winston.transports.Console()],
});

export const formatHTTPLoggerData = (
  req: express.Request,
  res: express.Response,
  responseBody: any
) => {
  return {
    request: {
      headers: req.headers,
      host: req.headers.host,
      baseUrl: req.baseUrl,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      clientIp: req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
    },
    response: {
      headers: res.getHeaders(),
      statusCode: res.statusCode,
      body: responseBody,
    },
  };
};
