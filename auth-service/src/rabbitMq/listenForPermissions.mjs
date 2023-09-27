import amqp from "amqplib";
import Permissions from "../models/permissions.mjs";
import { Op } from "sequelize";
import { getRoleData } from '../utils/index.mjs'

const storePermissions = async (permissions, service) => {
  if (!service) {
    throw new Error("Service value is undefined.");
  }

  const allRoutesName = [];
  const allRoutesPath = [];
  const permissionsToAdd = [];
  for (const perm of permissions) {
    let name = perm.name;
    if (
      !name.replaceAll("-", " ").includes("login") &&
      !name.replaceAll("-", " ").includes("register")
    ) {
      let path = perm.path;

      const obj = {
        name: name,
        path: path,
        service: service,
      };

      allRoutesName.push(name);
      allRoutesPath.push(path);

      const permission = await Permissions.findOne({ where: obj });
      if (!permission) {
        permissionsToAdd.push(obj);
      }
    }
  }

  if (permissionsToAdd.length > 0) {
    await Permissions.bulkCreate(permissionsToAdd);
  }

  await Permissions.destroy({
    where: { path: { [Op.notIn]: allRoutesPath }, service: service },
  });

};

export const listenForPermissions = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "permissionsExchange";
  const queueName = "permissionsQueue";
  const routingKey = "newPermissions";

  await channel.assertExchange(exchange, "direct", { durable: false });
  const q = await channel.assertQueue(queueName, { exclusive: false });

  channel.bindQueue(q.queue, exchange, routingKey);

  channel.consume(
    q.queue,
    async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const permissions = data.permissions;
      const service = data.service;

      await storePermissions(permissions, service);
      await getRoleData();
    },
    { noAck: true }
  );
};
