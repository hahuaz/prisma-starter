import amqplib, { Channel } from "amqplib";

import { sleep } from "@/lib";

// Singleton pattern: only one channel per application
let channel: Channel;

export async function getRabbitMQChannel(retries = 5, delay = 15000) {
  if (channel) {
    return channel;
  }

  let attempts = 0;
  while (attempts < retries) {
    try {
      console.log("Attempt to connect RabbitMQ...");
      const connection = await amqplib.connect("amqp://rabbitmq:5672");
      channel = await connection.createChannel();
      console.log("Connected to RabbitMQ");
      break; // Exit the loop if connection is successful
    } catch (error) {
      console.error(
        `Failed to connect to RabbitMQ. Retrying in ${delay / 1000} seconds.`,
        error
      );
      if (attempts === retries - 1) {
        console.error(
          "Failed to connect to RabbitMQ after several attempts. Gracefully shutting down."
        );
        process.exit(1);
      }

      attempts++;
      await sleep(delay);
    }
  }
  return channel;
}
