import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}
const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));

export default client;
