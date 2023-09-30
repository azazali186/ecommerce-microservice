import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const translationSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  languageCode: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
});

translationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const ProductPrices = mongoose.model("translations", translationSchema);

export default ProductPrices;
