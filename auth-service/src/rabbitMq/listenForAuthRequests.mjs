import { connect } from "amqplib";
import Role from "../models/roles.mjs";
import User from "../models/user.mjs";
import Permission from "../models/permissions.mjs";

const authenticateUser = async (userData) => {
  let granted = false;

  let user = await User.findOne({
    where: { id: userData.userId },
    include: [
      {
        model: Role,
        attributes: ["id", "name", "isActive"],
        include: [
          {
            model: Permission,
            attributes: ["id", "path", "name", "service"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  let role = user?.dataValues.Role;
  let permissions = role?.dataValues.Permissions;

  let path = userData.route;

  if (path.endsWith("-")) {
    path = path.slice(0, -1);
  }
  const havingPerm = [];
  permissions?.map((p) => {
    havingPerm.push(p.dataValues.path);
  });

  granted = havingPerm.includes(path);
  return granted;
};

export const listenForAuthRequests = async () => {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue("auth_service_queue");

  channel.consume("auth_service_queue", async (msg) => {
    const userData = JSON.parse(msg.content.toString());

    const isAuthenticated = await authenticateUser(userData);

    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(
        JSON.stringify({
          userId: userData.userId,
          isAuthenticated,
        })
      ),
      {
        correlationId: msg.properties.correlationId,
      }
    );

    channel.ack(msg);
  });
};
