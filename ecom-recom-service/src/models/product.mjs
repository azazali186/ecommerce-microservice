import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.mjs";
import { v4 as uuidv4 } from "uuid";

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4().replace(/-/g, ""),
    },
    productId: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products"
  }
);

export default Product;
