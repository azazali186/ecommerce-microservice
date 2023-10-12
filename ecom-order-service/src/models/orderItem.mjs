import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

const orderItemSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, '')
  },
  sku: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  totalPrice: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

orderItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const OrderItem = mongoose.model('orderItem', orderItemSchema);

export default OrderItem;