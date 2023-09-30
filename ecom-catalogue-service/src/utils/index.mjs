import Permissions from "../models/permissions.mjs";
import { sendPermissionsToAuthServer } from "../rabbitMq/sendPermissionsToAuthServer.mjs";

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

async function findOrCreatePermission(name, path) {
  let permission = await Permissions.findOne({ name: name, path: path });

  if (!permission) {
    permission = await Permissions.create({ name: name, path: path });
    return [false, permission];
  }

  return [permission, false];
}

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
      const [permission, created] = await findOrCreatePermission(name, path);
    } catch (error) {
      console.error("Error in getPermissionsData:", error);
    }
  });
};

export const paginate =
  (model, populate = []) =>
  async (req, res, next) => {
    const { page = 1, rowPerPage = 10, startDate, endDate } = req.query;
    const limit = Number(rowPerPage);
    const skip = (Number(page) - 1) * limit;
    const filter = req.query.filter || {};
    if (startDate || endDate) {
      filter["createdAt"] = {};
      if (startDate) filter["createdAt"]["$gte"] = new Date(startDate);
      if (endDate) filter["createdAt"]["$lte"] = new Date(endDate);
    }

    try {
      const totalCount = await model.countDocuments(filter);
      const data = await model
        .find(filter)
        .populate(populate)
        .limit(limit)
        .skip(skip)
        .exec();

      const totalPages = Math.ceil(totalCount / limit);

      const result = {
        data: data,
        currentPage: Number(page),
        nextPage: Number(page) < totalPages ? Number(page) + 1 : null,
        totalPage: totalPages,
        rowPerPage: limit,
        totalRecords: totalCount,
      };

      // Pass results to next middleware
      req.paginatedResults = result;

      next();
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

export const inserData = async (expressListRoutes, app) => {
  await getPermissionsData(expressListRoutes, app);
  await sendPermissionsToAuthServer();
};

export default { getMethodName, inserData, paginate };
