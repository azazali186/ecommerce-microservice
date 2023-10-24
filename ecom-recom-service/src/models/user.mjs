import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.mjs";
import { v4 as uuidv4 } from "uuid";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4().replace(/-/g, ""),
    },
    userId: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
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
    modelName: "User",
    tableName: "users"
  }
);

export default User;
