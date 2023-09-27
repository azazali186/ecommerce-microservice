import { connect } from 'amqplib';

export const requestAuthentication = async (userData) => {
    const connection = await connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue('auth_service_queue', Buffer.from(JSON.stringify(userData)), { replyTo: queue.queue });

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

