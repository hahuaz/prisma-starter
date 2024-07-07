const { EXPRESS_SECRET, APP_PORT, REDIS_URL, DATABASE_URL, NODE_ENV } =
  process.env;

const requiredEnvVars = [
  "EXPRESS_SECRET",
  "APP_PORT",
  "REDIS_URL",
  "DATABASE_URL",
];

for (let i = 0; i < requiredEnvVars.length; i++) {
  const envVar = requiredEnvVars[i];
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config: {
  REDIS_URL: string;
  DATABASE_URL: string;
  EXPRESS_SECRET: string;
  TOKEN_EXPIRATION: string;
  IS_DEV: boolean;
  APP_PORT: number;
} = {
  REDIS_URL,
  DATABASE_URL: DATABASE_URL,
  EXPRESS_SECRET,
  TOKEN_EXPIRATION: "1h",
  APP_PORT: parseInt(APP_PORT),
  IS_DEV: NODE_ENV === "development",
};

export default config;
