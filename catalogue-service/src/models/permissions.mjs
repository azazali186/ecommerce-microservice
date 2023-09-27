import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

const permissionSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, '')
  },
  path: {
    type: String,
    allowNull: false
  },
  name: {
    type: String,
    allowNull: false
  },
  guard: {
    type: String,
    allowNull: false,
    defaultValue: 'web'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

permissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Permissions = mongoose.model('permissions', permissionSchema);

export default Permissions;