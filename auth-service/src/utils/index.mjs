import Permissions from "../models/permissions.mjs";
import Role from "../models/roles.mjs";
import { Op } from "sequelize";

export const getMethodName = (key) => {
  switch (key) {
    case "GET":
      return "View";
      break;
    case "POST":
      return "Create";
      break;
    case "PATCH":
    case "PUT":
      return "Edit-update";
      break;
    case "DELETE":
      return "delete";
      break;

    default:
      break;
  }
};

export async function getRoleData() {
  try {
    let adminRole = await Role.findOne({ where: { name: "admin" } });
    let permissions = await Permissions.findAll();
    
    if (!adminRole) {
        adminRole = await Role.create({
        name: "admin",
        permissions: permissions,
      });
    } else {
      adminRole.setPermissions(permissions);
    }

    await adminRole.save();

    let customerRole = await Role.findOne({ where: { name: "customer" } });
    if (!customerRole) {
      await Role.create({ name: "customer" });
    }
  } catch (error) {
    console.error("Error in getRoleData:", error);
  }
}

const getPermissionsData = async (expressListRoutes, app) => {
  const allRoute = expressListRoutes(app);
  const allRoutesName = [];
  const allRoutesPath = [];
  const permissionsToAdd = [];

  for (const routeData of allRoute) {
    let name = (
      getMethodName(routeData.method) +
      routeData.path.replaceAll("/", "-").split(":")[0]
    ).toLowerCase();
    if (name.endsWith("-")) {
      name = name.slice(0, -1);
    }

    if (
      !name.replaceAll("-", " ").includes("login") &&
      !name.replaceAll("-", " ").includes("register")
    ) {
      let path = routeData.path;
      if (path.endsWith("/")) {
        path = path.slice(0, -1);
      }

      const obj = {
        name: name,
        path: path,
        service: "auth-service",
      };

      allRoutesName.push(name);
      allRoutesPath.push(path);

      const permission = await Permissions.findOne(obj);
      if (!permission) {
        permissionsToAdd.push(obj);
      }
    }
  }

  if (permissionsToAdd.length > 0) {
    await Permissions.bulkCreate(permissionsToAdd);
  }
  await Permissions.destroy({ where: { path: { [Op.notIn]: allRoutesPath }, service: 'auth-service' } });
};

export const inserData = async (expressListRoutes, app) => {
  getPermissionsData(expressListRoutes, app);
  await getRoleData();
};

export default { getMethodName, inserData, getRoleData };
