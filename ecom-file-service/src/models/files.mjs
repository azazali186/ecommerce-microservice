import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

const fileSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, '')
  },
  path: {
    type: String,
    allowNull: false
  },
  typeId: {
    type: String,
    allowNull: false
  },
  type: {
    type: String,
    allowNull: false,
    defaultValue: 'product'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

fileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Files = mongoose.model('files', fileSchema);

export default Files;