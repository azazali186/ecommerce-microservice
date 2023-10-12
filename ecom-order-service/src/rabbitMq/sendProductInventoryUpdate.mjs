import amqp from "amqplib";

export const sendPermissionsToAuthServer = async () => {

  const permissions = await Permission.find();

  const connection = await amqp.connect(process.env.RABBIT_MQ_URL || "amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "ecommerce_product_stock_exchange";
  const routingKey = "ecommerce_product_stock";

  await channel.assertExchange(exchange, "direct", { durable: false });
  channel.publish(
    exchange,
    routingKey,
    Buffer.from(
      JSON.stringify({ permissions: permissions, service: "order-service" })
    )
  );

  setTimeout(() => {
    connection.close();
  }, 500);
};
