import { createClient } from "redis";

import config from "@/config";

const { REDIS_URL } = config;

/**
 * Redis client instance
 */
export const redis = createClient({
  url: REDIS_URL,
});

redis.on("error", (err) => console.log("Redis Client Error", err));
