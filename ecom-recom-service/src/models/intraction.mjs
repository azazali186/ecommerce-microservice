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
      allowNull: true,
      defaultValue: 0.0
   },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
         model: 'users',
         key: 'id'
      }
   },
   productId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
         model: 'products',
         key: 'id'
      }
   },
   
    type: {
      type: DataTypes.STRING,
      required: true,
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
    modelName: "Intraction",
    tableName: "intractions",
  }
);

export default Intraction;
