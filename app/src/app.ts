import express from "express";

import redis from "./config/redis";
import { getRabbitMQChannel } from "./config/rabbitmq";
import router from "./router";

const EXPRESS_PORT = 3000;

const app = express();

// parse application/x-www-form-urlencoded body
app.use(express.urlencoded({ extended: true }));
// parse application/json body
app.use(express.json());

router(app);

// connect to services and start the express app
const startApp = async () => {
  await redis.connect();

  const rabbitmqChannel = await getRabbitMQChannel();
  await rabbitmqChannel.assertQueue("validate-name");

  app.listen(EXPRESS_PORT, () => {
    console.log(
      `You can connect to express app on http://localhost:${EXPRESS_PORT}`
    );
  });
};
startApp();
