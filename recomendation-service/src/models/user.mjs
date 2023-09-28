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
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users"
  }
);

export default User;
