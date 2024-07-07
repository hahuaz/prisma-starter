import { createClient } from "redis";

import config from "@/config";

const { REDIS_URL } = config;

const client = createClient({
  url: REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));

export default client;
