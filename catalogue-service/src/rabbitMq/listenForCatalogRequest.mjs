import { connect } from "amqplib";
import Product from "../models/product.mjs";

const getProductData = async (productData) => {
  const productIds = productData.productIds;
  if (!productIds || productIds.length === 0) {
    return [];
  }
  const products = await Product.find({ _id: { $in: productIds } })
    .populate("stocks") // Assuming a 'stocks' field references the Stock model
    .populate("category");

  const filteredProducts = products.filter(
    (product) => product.stocks.length > 0
  );
  return filteredProducts;
};

export const listenForCatalogRequest = async () => {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue("catalog_service_queue");

  channel.consume("catalog_service_queue", async (msg) => {
    const productData = JSON.parse(msg.content.toString());

    const products = await getProductData(productData);

    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(
        JSON.stringify({
          data: products,
        })
      ),
      {
        correlationId: msg.properties.correlationId,
      }
    );
    channel.ack(msg);
  });
};
