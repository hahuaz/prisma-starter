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
