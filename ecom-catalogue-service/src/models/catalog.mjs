import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const catalogSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ""),
  },
  catalogId: {
    type: String,
    required: true,
    trim: true,
  },
  prooductId: [
    {
      type: Schema.Types.String,
      ref: "products",
    },
  ],
  translation: [
    {
      type: Schema.Types.String,
      ref: "translations",
    },
  ],
  isActive: {
    type: Boolean,
    required: false,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

catalogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Catalog = mongoose.model("catalogs", catalogSchema);

export default Catalog;
