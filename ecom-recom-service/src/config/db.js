import mongoose from "mongoose";

const url = process.env.TENSORFLOW_DB_URL || "mongodb://192.168.30.28:3153";
export let db;

export const mongoConnect = () => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");

      // Here's your database instance
      db = mongoose.connection;

      // You can now use 'db' for various operations.
      // For example, listening for further connection events:
      db.on("error", console.error.bind(console, "MongoDB connection error:"));
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err);
    });
};
