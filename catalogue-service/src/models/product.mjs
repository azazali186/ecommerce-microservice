import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Category from './category.mjs';
import Stocks from './stocks.mjs';

const { Schema } = mongoose;

const productSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, '')
  },
  isVariant:{
    type: Boolean,
    default: false
  },
  stock: [{
    type: Schema.Types.String,
    ref: 'stocks'
  }],
  categories: [{
    type: Schema.Types.String,
    ref: 'category'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;