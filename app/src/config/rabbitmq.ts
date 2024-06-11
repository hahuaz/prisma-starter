import amqplib, { Channel } from "amqplib";

// Singleton pattern: only one channel per application
let channel: Channel;

export async function getRabbitMQChannel() {
  if (!channel) {
    console.log("Connecting to RabbitMQ...");
    // TODO: error on first run
    //  express-app  | Error: connect ECONNREFUSED 172.19.0.4:5672
    // express-app  |     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1555:16) {
    //   express-app  |   errno: -111,
    //   express-app  |   code: 'ECONNREFUSED',
    //   express-app  |   syscall: 'connect',
    //   express-app  |   address: '172.19.0.4',
    //   express-app  |   port: 5672
    //   express-app  | }
    const connection = await amqplib.connect("amqp://rabbitmq:5672");
    channel = await connection.createChannel();
  }
  return channel;
}
