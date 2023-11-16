import Permissions from "../models/permissions.mjs";
import { Op } from "sequelize";

import { esClient } from "../config/esClient.js";
import Product from "../models/product.mjs";
import Intraction from "../models/intraction.mjs";
import {
  getIntractionValue,
  trainTensorFlowModel,
} from "./trainTensorFlowModel.mjs";

import { sendPermissionsToAuthServer } from "../rabbitMq/sendPermissionsToAuthServer.mjs";
import User from "../models/user.mjs";

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
  const allRoutes = expressListRoutes(app);
  allRoutes.forEach(async (routeData) => {
    let name = (
      getMethodName(routeData.method) +
      routeData.path.split(":")[0].replaceAll("/", "-")
    ).toLowerCase();
    name = name.endsWith("-") ? name.slice(0, -1) : name;

    let path = routeData.path.endsWith("/")
      ? routeData.path.slice(0, -1)
      : routeData.path;

    try {
      const [permission, created] = await Permissions.findOrCreate({
        where: { name: name, path: path },
        defaults: { name: name, path: path },
      });
    } catch (error) {
      console.error("Error in getPermissionsData:", error);
    }
  });
};

export const inserData = async (expressListRoutes, app) => {
  await getPermissionsData(expressListRoutes, app);
  await sendPermissionsToAuthServer();
};

export const createEs = async (name, body) => {
  try {
    console.log("body is ", body);
    await esClient.index({
      index: name,
      body: body,
    });
  } catch (err) {
    console.log("err", err);
    return { error: "Error indexing product in Elasticsearch" };
  }
};

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
    console.log("err", err);
    return { error: "Error updating product in Elasticsearch." };
  }
};

async function createIntraction(productId, userId, intraction) {
  return await new Intraction({
    productId: productId,
    userId: userId,
    type: intraction,
    rating: getIntractionValue(intraction),
  }).save();
}

export const createProductData = async (
  productId,
  name,
  description,
  intraction,
  userId
) => {
  await new User({
    userId: userId,
    username: userId,
  }).save();

  const product = await new Product({
    name: name,
    productId: productId,
    description: description,
  }).save();

  await createIntraction(product.id, userId, intraction);
  await createEs("products", product.dataValues);
  try {
    await trainTensorFlowModel();
  } catch (err) {
    console.log("err", err);
    return { error: "Error updating recommendation model" };
  }
  return product;
};

export default { getMethodName, inserData };
