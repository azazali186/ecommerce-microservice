import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.mjs";
import { v4 as uuidv4 } from "uuid";

class UserInteraction extends Model {}

UserInteraction.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4().replace(/-/g, ""),
    },
    username: {
      type: DataTypes.STRING,
    }
  },
  {
    sequelize,
    modelName: "UserInteraction",
    tableName: "userInteractions"
  }
);

export default UserInteraction;
