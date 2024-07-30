const { EXPRESS_SECRET, APP_PORT, REDIS_URL, DATABASE_URL, NODE_ENV } =
  process.env;

const requiredEnvVars = [
  "EXPRESS_SECRET",
  "APP_PORT",
  "REDIS_URL",
  "DATABASE_URL",
  "NODE_ENV",
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
  APP_PORT: number;
  APP_VERSION: string | undefined;
  NODE_ENV: string;
  IS_DEV: boolean;
  IS_PROD: boolean;
} = {
  REDIS_URL,
  DATABASE_URL: DATABASE_URL,
  EXPRESS_SECRET,
  TOKEN_EXPIRATION: "1h",
  APP_PORT: parseInt(APP_PORT),
  APP_VERSION: process.env.npm_package_version,
  NODE_ENV,
  IS_DEV: NODE_ENV === "development",
  IS_PROD: NODE_ENV === "production",
};
console.log("config:\n", config);

export default config;
