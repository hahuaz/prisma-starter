import amqplib, { Channel } from "amqplib";
import express from "express";
import helmet, { HelmetOptions } from "helmet";
import path from "path";

import config from "@/config";
import { pg, redis } from "@/db";
import { ephemeralStorage, sleep } from "@/lib";
import { corsMiddleware, errorMiddleware } from "@/middleware";
import { apiRouter } from "@/routes/api";

const { APP_PORT } = config;

// TODO: implement docs
// TODO: implement cron jobs
// TODO: use smtp for email sending

export class App {
  private app: express.Application = express();
  private rabbitMQChannel: Channel;

  constructor() {
    void this.bootstrap();
  }

  public async bootstrap() {
    this.setAppMiddlewares();
    this.serveStatic();
    this.app.use("/api", apiRouter);

    await Promise.all([
      this.connectDrizzle(),
      this.connectRedis(),
      this.connectRabbitMQ(),
    ]);

    // publisher creates queue to fasten the process
    await this.rabbitMQChannel.assertQueue("validate-name");

    this.app.use(errorMiddleware);

    this.app.listen(APP_PORT, () => {
      console.log(
        `You can ping to express app on http://localhost:${APP_PORT}/api/ping`
      );
      void ephemeralStorage.put(
        "bootstrap.txt",
        `Express app is running on port ${APP_PORT} at ${new Date()}`
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
      express.static(path.join(__dirname, "..", "public", "frontend"), {
        // index: true,
        dotfiles: "ignore",
      })
    );
  }

  private setAppMiddlewares() {
    const helmetOptions: HelmetOptions = {};
    this.app.use(helmet(helmetOptions));
    this.app.use(corsMiddleware);
  }
}

new App();
