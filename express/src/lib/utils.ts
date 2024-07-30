import { randomBytes } from "crypto";

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
