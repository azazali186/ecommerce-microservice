import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const stocksSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  productId: {
    type: Schema.Types.String,
    ref: "product",
  },
  translation: [
    {
      type: Schema.Types.String,
      ref: "translations",
    },
  ],
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  images: [
    {
      type: String,
    },
  ],
  variations: [
    {
      type: Schema.Types.String,
      ref: "variations",
    },
  ],
  price: [
    {
      type: Schema.Types.String,
      ref: "productPrice",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

stocksSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Stock = mongoose.model("stocks", stocksSchema);

export default Stock;
