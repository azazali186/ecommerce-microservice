import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.mjs';
import Role from './roles.mjs';
import { v4 as uuidv4 } from 'uuid';

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4().replace(/-/g, '')
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "roles", 
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    accessToken: {
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    version: false,
  }
);


export default User;