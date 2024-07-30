import { randomBytes } from "crypto";

import { AnyObj } from "../types";

/**
 * Normalize the path by removing trailing slashes
 */
export function normalizePath(path) {
  return path.replace(/\/+$/, "");
}

/**
 * Sleep for a while
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random hex string of 16 bytes.
 * It is used to generate a unique id.
 */
export const generateRandomHex = (): string => randomBytes(16).toString("hex");

/**
 * Redact sensitive fields from the data
 */
export const redact = ({
  data,
  redactEnums,
}: {
  data: AnyObj | AnyObj[] | string;
  redactEnums: string[];
}) => {
  // Recursive redaction function which directly mutates the data
  const redactHelper = (data: AnyObj | AnyObj[] | string) => {
    if (Array.isArray(data)) {
      data.forEach((item) => redactHelper(item));
    } else if (data !== null && typeof data === "object") {
      Object.keys(data).forEach((key) => {
        if (redactEnums.includes(key)) {
          data[key] = "**REDACTED**";
        } else if (typeof data[key] === "object") {
          redactHelper(data[key] as AnyObj);
        }
      });
    }
  };

  // deep clone the data to avoid mutating the original data
  const redactedData =
    typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(JSON.stringify(data));

  redactHelper(redactedData);

  return redactedData;
};
