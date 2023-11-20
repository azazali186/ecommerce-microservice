import { connect } from 'amqplib';

export const requestProducts = async (productData) => {
    const connection = await connect(process.env.RABBIT_MQ_URL || "amqp://admin:admin@192.168.30.28:3156");
    const channel = await connection.createChannel();

    const queue = await channel.assertQueue('', { exclusive: true });

    console.log("requset stated for productData ", productData)

    channel.sendToQueue('ecom_catalogue_service_queue', Buffer.from(JSON.stringify(productData)), { replyTo: queue.queue });

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

