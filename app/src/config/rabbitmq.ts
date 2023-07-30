import amqplib, { Channel } from "amqplib";

// Singleton pattern: only one channel per application
let channel: Channel;

export async function getRabbitMQChannel() {
  if (!channel) {
    console.log("Connecting to RabbitMQ...");
    const connection = await amqplib.connect("amqp://rabbitmq:5672");
    channel = await connection.createChannel();
  }
  return channel;
}
