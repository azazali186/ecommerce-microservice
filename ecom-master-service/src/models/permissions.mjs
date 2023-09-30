import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.mjs';
import { v4 as uuidv4 } from 'uuid';

class Permission extends Model {}

Permission.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4().replace(/-/g, '')
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guard: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'web'
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Permission',
  tableName: 'permissions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

export default Permission;