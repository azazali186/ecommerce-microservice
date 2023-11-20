import { connect } from "amqplib";
import Product from "../models/product.mjs";

const productQuantitySync = async (data) => {
  const res = {};
  const product = await Product.findOne({
    sku: data.sku,
  });
  if (product.quantity >= data.quantity) {
    product.quantity = product.quantity - data.quantity;
    await product.save();
    res.message = "success";
    res.data = product;
  } else {
    res.error =
      "Insufficient quantity remainig quantity is " + product.quantity;
    res.data = {
      quantity: product.quantity,
    };
  }
  return res;
};

export const listenForProductStockRequest = async () => {
  const connection = await connect(
    process.env.RABBIT_MQ_URL || "amqp://localhost"
  );
  const channel = await connection.createChannel();

  const queueName = "ecommerce_product_stock_queue";
  const exchange = "ecommerce_product_stock_exchange";
  const routingKey = "ecommerce_product_stock";

  await channel.assertExchange(exchange, "direct", { durable: false });
  const q = await channel.assertQueue(queueName, { exclusive: false });

  channel.bindQueue(q.queue, exchange, routingKey);

  channel.consume(q.queue, async (msg) => {
    const data = JSON.parse(msg.content.toString());

    const res = await productQuantitySync(data);

    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(res)),
      {
        correlationId: msg.properties.correlationId,
      }
    );
    channel.ack(msg);
  });
};
