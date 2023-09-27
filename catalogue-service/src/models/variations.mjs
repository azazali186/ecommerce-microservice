import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const variationSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  stockId: {
    type: Schema.Types.String,
    ref: 'stocks'
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

variationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Variations = mongoose.model("variations", variationSchema);

export default Variations;
