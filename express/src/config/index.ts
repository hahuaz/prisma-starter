const { EXPRESS_SECRET, NODE_ENV, APP_PORT } = process.env;

if (!EXPRESS_SECRET) {
  console.error("EXPRESS_SECRET is not set");
  process.exit(1);
}

if (!APP_PORT) {
  console.error("APP_PORT is not set");
  process.exit(1);
}

const config: {
  EXPRESS_SECRET: string;
  TOKEN_EXPIRATION: string;
  IS_DEV: boolean;
  APP_PORT: number;
} = {
  EXPRESS_SECRET,
  TOKEN_EXPIRATION: "1h",
  IS_DEV: NODE_ENV === "development",
  APP_PORT: parseInt(APP_PORT),
};

export default config;
