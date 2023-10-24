import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Translation from './translation.mjs';
import Stock from './stocks.mjs';
import Category from './category.mjs';
import ProductMetaData from './productMetaData.mjs';

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
  translation: [
    {
      type: Schema.Types.String,
      ref: "translations"
    },
  ],
  sku:{
    type: String,
    required: true,
    unique: true
  },
  quantity: [
    {
      type: String,
      required: true,
    },
  ],
  stock: [{
    type: Schema.Types.String,
    ref: "stocks"
  }],
  categories: [{
    type: Schema.Types.String,
    ref: Category
  }],
  meta: [{
    type: Schema.Types.String,
    ref: "productMetaDatas"
  }],
  isActive: {
    type: Boolean,
    default: true
  },
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

const Product = mongoose.model('products', productSchema);

export default Product;