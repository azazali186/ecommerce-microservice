import { connect } from "amqplib";

export const sendProfileToProfileService = async (profileData) => {
  const connection = await connect(process.env.RABBIT_MQ_URL || "amqp://localhost");
  const channel = await connection.createChannel();

  const queue = await channel.assertQueue("", { exclusive: true });

  channel.sendToQueue(
    "ecommerce_create_user_profile",
    Buffer.from(JSON.stringify(profileData)),
    { replyTo: queue.queue }
  );

  const response = await new Promise((resolve) => {
    channel.consume(queue.queue, (msg) => {
      resolve(msg.content.toString());
      channel.ack(msg);
    });
  });

  await channel.close();
  await connection.close();

  return response;
};
