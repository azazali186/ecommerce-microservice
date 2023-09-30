import amqp from "amqplib";
import Permission from "../models/permissions.mjs";

export const sendPermissionsToAuthServer = async () => {

  const permissions = await Permission.findAll();

  const connection = await amqp.connect(process.env.RABBIT_MQ_URL || "amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "ecommerce_permissions_exchange";
  const routingKey = "ecommerce_new_permissions";

  await channel.assertExchange(exchange, "direct", { durable: false });
  channel.publish(
    exchange,
    routingKey,
    Buffer.from(
      JSON.stringify({ permissions: permissions, service: "master-service" })
    )
  );

  setTimeout(() => {
    connection.close();
  }, 500);
};
