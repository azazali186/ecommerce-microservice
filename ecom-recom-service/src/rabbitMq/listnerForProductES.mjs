import { createProductData } from "../utils/index.mjs";

export const listnerForProductES = async () => {
  const connection = await connect(process.env.RABBIT_MQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue("ecom_product_recom_service");

  channel.consume("ecom_product_recom_service", async (msg) => {
    const productData = JSON.parse(msg.content.toString());

    const { productId, name, description, intraction, userId } = productData

    const products = await createProductData(productId, name, description, intraction, userId)

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
