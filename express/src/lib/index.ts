/**
 * Normalize the path by removing trailing slashes
 */
export function normalizePath(path) {
  return path.replace(/\/+$/, "");
}
