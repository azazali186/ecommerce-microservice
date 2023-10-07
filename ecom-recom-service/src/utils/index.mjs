import Permissions from "../models/permissions.mjs";
import { Op } from "sequelize";

import { esClient } from "../config/esClient.js";
import Product from "../models/product.mjs";
import Intraction from "../models/intraction.mjs";
import { getIntractionValue } from "./trainTensorFlowModel.mjs";

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
};


export const createEs = async (name, body) => {
  try {
    esClient.index({
      index: name,
      body: body,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error indexing product in Elasticsearch" });
  }
}

export const updateEs = async (id, name, body) => {
  try {
    esClient.update({
      index: name,
      id: id,
      body: {
        doc: body,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error updating product in Elasticsearch." });
  }
}

async function createIntraction(productId, userId, intraction) {
  return await Intraction.create({
    productId: productId,
    userId: userId,
    type: intraction,
    rating: getIntractionValue(intraction),
  }).save();
}

export const createProductData = async (productId, name, description, intraction, userId) => {

  const product = await Product.create({
    name: name,
    productId: productId,
    description: description,
  }).save();

  await createIntraction(product.id, userId, intraction);
  await createEs("products", product)
  // Train/update your TensorFlow model
  try {
    // Hypothetical function to update your recommendation model with new data
    await trainTensorFlowModel();

  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error updating recommendation model" });
  }
  return product
}

export default { getMethodName, inserData };
