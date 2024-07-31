import amqplib, { Channel } from "amqplib";

import { sendEmail, sleep } from "@/lib";

// rabbitmq may not be ready to start new connections, so we need to retry
export async function getRabbitMQChannel(
  retries = 5,
  delay = 15000
): Promise<Channel> {
  let channel: Channel | undefined;

  let attempts = 0;
  while (attempts < retries) {
    try {
      const connection = await amqplib.connect("amqp://rabbitmq:5672");
      channel = await connection.createChannel();
      break; // Exit the loop if connection is successful
    } catch (error) {
      if (attempts <= retries - 1) {
        console.error(
          `Failed to connect to RabbitMQ. Retrying in ${delay / 1000} seconds.`,
          error
        );
      }
      attempts++;
      await sleep(delay);
    }
  }

  if (!channel) {
    console.error(
      "Failed to connect to RabbitMQ after several attempts. Gracefully shutting down."
    );
    process.exit(1);
  }

  return channel;
}

(async () => {
  const channel = await getRabbitMQChannel();
  console.log("ready to consume messages");
  await channel.consume("welcome-email", async (msg) => {
    if (msg !== null) {
      const message = msg.content.toString();
      console.log("welcome-email:", message);
      await sendEmail(JSON.parse(message));
      channel.ack(msg); // Acknowledge the message to remove it from the queue
    }
  });
})();
