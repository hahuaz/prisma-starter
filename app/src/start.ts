import { Express } from "express";

import { getRabbitMQChannel } from "@/config/rabbitmq";
import redis from "@/config/redis";

const { APP_PORT } = process.env;

/**
 * Connect to services and start the app
 */
export const start = async (app: Express) => {
  await redis.connect();

  const rabbitmqChannel = await getRabbitMQChannel();

  // TODO rabbitmq queue creation should be seperated from publisher
  await rabbitmqChannel.assertQueue("validate-name");

  app.listen(APP_PORT, () => {
    console.log(
      `You can connect to express app on http://localhost:${APP_PORT}`
    );
  });
};
