import amqplib, { Channel } from "amqplib";

const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 5000; // 5 seconds

let channel: Channel;

// rabbitmq may not be ready to start new connections, so we need to retry
export async function getRabbitMQChannel() {
  if (!channel) {
    console.log("Connecting to RabbitMQ...");
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const connection = await amqplib.connect("amqp://rabbitmq:5672");
        channel = await connection.createChannel();
        break; // Success, break out of the retry loop
      } catch (error) {
        console.error(
          `Failed to connect to RabbitMQ on try ${retries}: ${error}`
        );
        retries++;
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      }
    }

    if (!channel) {
      throw new Error("Failed to connect to RabbitMQ after max retries.");
    }
  }
  return channel;
}

(async () => {
  const channel = await getRabbitMQChannel();
  await channel.consume("validate-name", (msg) => {
    if (msg !== null) {
      const message = msg.content.toString();
      // Process the message here
      console.log("Received message:", message);
      channel.ack(msg); // Acknowledge the message to remove it from the queue
    }
  });
  console.log("Waiting for messages...");
})();
