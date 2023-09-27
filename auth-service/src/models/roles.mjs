import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.mjs';
import { v4 as uuidv4 } from 'uuid';
import User from './user.mjs';
import Permission from './permissions.mjs';

// Role Model
class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4().replace(/-/g, '')
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  modelName: 'Role',
  tableName: 'roles',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

export default Role;
