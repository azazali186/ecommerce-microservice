import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const cartSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  items: [{
    type: Schema.Types.String,
    ref: 'cartItem'
  }],
  status: {
    type: Schema.Types.String,
    required: false,
    default: "ACTIVE",
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model("cart", cartSchema);

export default Cart;
