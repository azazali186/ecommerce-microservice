import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Stock from "./stocks.mjs";

const { Schema } = mongoose;

const ppSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  stockId: {
    type: Schema.Types.String,
    ref: "stocks"
  },
  currencyCode: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

ppSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const ProductPrice = mongoose.model("productPrices", ppSchema);

export default ProductPrice;
