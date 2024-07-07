const { EXPRESS_SECRET, NODE_ENV, APP_PORT, REDIS_URL } = process.env;

if (!EXPRESS_SECRET) {
  console.error("EXPRESS_SECRET is not set");
  process.exit(1);
}

if (!APP_PORT) {
  console.error("APP_PORT is not set");
  process.exit(1);
}

if (!REDIS_URL) {
  console.error("REDIS_URL is not set");
  process.exit(1);
}

const config: {
  EXPRESS_SECRET: string;
  TOKEN_EXPIRATION: string;
  REDIS_URL: string;
  IS_DEV: boolean;
  APP_PORT: number;
} = {
  EXPRESS_SECRET,
  REDIS_URL,
  TOKEN_EXPIRATION: "1h",
  APP_PORT: parseInt(APP_PORT),
  IS_DEV: NODE_ENV === "development",
};

export default config;
