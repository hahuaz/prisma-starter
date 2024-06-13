import express from "express";

import { getRabbitMQChannel } from "@/config/rabbitmq";
import redis from "@/config/redis";
import middleware from "@/middleware";
import router from "@/router";

const { APP_PORT } = process.env;

const app = express();

middleware(app);

router(app);

/**
 * Connect to services and start the app
 */
const startApp = async () => {
  await redis.connect();

  const rabbitmqChannel = await getRabbitMQChannel();
  await rabbitmqChannel.assertQueue("validate-name");

  app.listen(APP_PORT, () => {
    console.log(
      `You can connect to express app on http://localhost:${APP_PORT}`
    );
  });
};
startApp();
