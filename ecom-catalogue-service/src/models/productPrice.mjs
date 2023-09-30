import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const ppSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  stockId: {
    type: Schema.Types.String,
    ref: 'stocks'
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

const ProductPrices = mongoose.model("productPrice", ppSchema);

export default ProductPrices;
