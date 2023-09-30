import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const productMetaDataSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  productId: {
    type: Schema.Types.String,
    ref: 'product'
  },
  languageCode: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

productMetaDataSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const ProductPrices = mongoose.model("productMetaData", productMetaDataSchema);

export default ProductPrices;
