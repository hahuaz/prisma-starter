import amqplib, { Channel } from "amqplib";
import express from "express";

import config from "@/config";
import { pg, redis } from "@/db";
import { sleep } from "@/lib";
import { errorMiddleware } from "@/middleware";
import { apiRouter } from "@/routes/api";

const { APP_PORT } = config;

export class App {
  private app: express.Application = express();
  private rabbitMQChannel: Channel;

  constructor() {
    this.bootstrap();
  }

  public async bootstrap() {
    this.app.use("/api", apiRouter);

    await this.connectDrizzle();

    await this.connectRedis();

    await this.connectRabbitMQ();
    // publisher creates queue to fasten the process
    await this.rabbitMQChannel.assertQueue("validate-name");

    this.serveStatic();

    this.app.use(errorMiddleware);

    this.app.listen(APP_PORT, () => {
      console.log(
        `You can ping to express app on http://localhost:${APP_PORT}/api/ping`
      );
    });
  }

  private async connectDrizzle() {
    try {
      await pg.connect();
    } catch (error) {
      console.error("Error connecting to the database", error);
      throw error;
    }
  }

  private async connectRedis() {
    try {
      await redis.connect();
    } catch (error) {
      console.error("Error connecting to the redis", error);
      throw error;
    }
  }

  private async connectRabbitMQ(retries = 5, delay = 15000) {
    let attempts = 0;
    while (attempts < retries) {
      try {
        const connection = await amqplib.connect("amqp://rabbitmq:5672");
        this.rabbitMQChannel = await connection.createChannel();
        break; // Exit the loop if connection is successful
      } catch (error) {
        if (attempts === retries - 1) {
          console.error(
            "Failed to connect to RabbitMQ after several attempts. Gracefully shutting down."
          );
          process.exit(1);
        } else {
          console.error(
            `Failed to connect to RabbitMQ. Retrying in ${
              delay / 1000
            } seconds.`,
            error
          );
        }

        attempts++;
        await sleep(delay);
      }
    }
  }

  private serveStatic() {
    this.app.use(
      express.static("public", {
        // index: true,
        dotfiles: "ignore",
      })
    );
  }
}

new App();
