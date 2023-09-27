import amqp from "amqplib";
import Permission from "../models/permissions.mjs";

export const sendPermissionsToAuthServer = async () => {

  const permissions = await Permission.findAll();

  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "permissionsExchange";
  const routingKey = "newPermissions";

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
