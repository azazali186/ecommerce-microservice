import Product from "../models/product.mjs";
import User from "../models/user.mjs";
import { createProductData } from "../utils/index.mjs";
import { connect } from "amqplib";

export const listnerForProductES = async () => {
  const connection = await connect(
    process.env.RABBIT_MQ_URL || "amqp://localhost"
  );
  const channel = await connection.createChannel();

  await channel.assertQueue("ecom_product_recom_service");

  channel.consume("ecom_product_recom_service", async (msg) => {
    const productData = JSON.parse(msg.content.toString());

    const { productId, name, description, intraction, userId } = productData;

    let user = await User.findOne({ where: { userId: userId } });

    let product = await Product.findOne({ where: { productId } });

    if(!user){
      user = await new User({
        userId: userId,
        username: userId,
      }).save();
    }

    if(!product){
      product = await new Product({
        name: name,
        productId: productId,
        description: description,
      }).save();
    }

    const products = await createProductData(
      product,
      intraction,
      userId
    );

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
