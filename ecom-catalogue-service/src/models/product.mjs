import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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
      ref: "translations",
    },
  ],
  sku:{
    type: String,
    default: "",
    required: true
  },
  quantity: [
    {
      type: String,
      required: true,
    },
  ],
  stock: [{
    type: Schema.Types.String,
    ref: 'stocks'
  }],
  categories: [{
    type: Schema.Types.String,
    ref: 'category'
  }],
  meta: [{
    type: Schema.Types.String,
    ref: 'productMetaData'
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

const Product = mongoose.model('product', productSchema);

export default Product;