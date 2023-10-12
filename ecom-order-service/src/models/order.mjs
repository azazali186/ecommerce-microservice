import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const orderSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  items: [{
    type: Schema.Types.String,
    ref: 'orderItem'
  }],
  status: {
    type: Schema.Types.String,
    required: false,
    default: "PENDING",
  },
  quantity: {
    type: Schema.Types.String,
    required: false,
  },
  price: {
    type: Schema.Types.String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model("order", orderSchema);

export default Order;
