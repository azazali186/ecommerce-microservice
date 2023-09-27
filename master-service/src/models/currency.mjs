import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.mjs'; // Assuming you have a Sequelize config in a similar location
import { v4 as uuidv4 } from 'uuid';

class Currency extends Model {}

Currency.init({
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
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
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
  modelName: 'Currency',
  tableName: 'currencies',
  timestamps: true,
  createdAt: 'createdAt', // Default, but included for clarity
  updatedAt: 'updatedAt'  // Default, but included for clarity
});

export default Currency;
