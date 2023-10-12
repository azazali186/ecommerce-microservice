import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

const cartItemSchema = new Schema({
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

cartItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CartItem = mongoose.model('cartItem', cartItemSchema);

export default CartItem;