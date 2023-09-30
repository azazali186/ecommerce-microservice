import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.mjs";
import { v4 as uuidv4 } from "uuid";

class Intraction extends Model {}

Intraction.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4().replace(/-/g, ""),
    },
    rating: {
      type: DataTypes.FLOAT,
      required: false,
      default : 0.0
    },
    userId: {
      type: DataTypes.STRING,
      required: true,
      references: 'users',

    },
    productId: {
      type: DataTypes.STRING,
      required: true,
      references: 'products',
    },
    type: {
      type: DataTypes.STRING,
      required: true,
    },
  },
  {
    sequelize,
    modelName: "Intraction",
    tableName: "intractions",
  }
);

export default Intraction;
