import { verifyTokenAndAuthorization } from "../../middleware/verifyToken.mjs";
import Product from "../../models/product.mjs";

import express from "express";
import Stocks from "../../models/stocks.mjs";
import Category from "../../models/category.mjs";
const productsRoutes = express.Router();

// Update Product
productsRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    const updatedProduct = await Product.update(req.body, {
      where: { id: req.params.id },
      returning: true, // To get the updated record
    });

    if (updatedProduct[0] === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = updatedProduct[1][0].toJSON();

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Product
productsRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    // Clean up related data if necessary
    await Stocks.deleteMany({ _id: { $in: product.stocks } });
    await Category.deleteMany({ _id: { $in: product.categories } });
    await product.remove();
    res.status(200).send({ message: "Product deleted" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get Product by ID
productsRoutes.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("stocks")
      .populate("categories");
    if (!product) return res.status(404).send("Product not found");
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get All Products
productsRoutes.get("/", async (req, res) => {
  try {
    // Extract query parameters
    const { category, sku, startDate, endDate, title } = req.query;

    // Initialize the query object
    let query = {};

    // Populate the query object based on provided filters
    if (category) query["categories.name"] = category; // Assuming category names are unique
    if (title) query["title"] = new RegExp(title, "i"); // This will allow for case-insensitive partial matching

    if (startDate || endDate) {
      query["createdAt"] = {};

      if (startDate) {
        query["createdAt"]["$gte"] = new Date(startDate);
      }

      if (endDate) {
        query["createdAt"]["$lte"] = new Date(endDate);
      }
    }

    // Fetch the products
    const products = await Product.find(query)
      .populate({
        path: "stocks",
        match: sku ? { sku: sku } : {}, // Filter embedded documents by SKU
      })
      .populate("categories");

    // Filter out products that didn't match the SKU query
    const filteredProducts = products.filter(
      (product) => product.stocks.length > 0
    );

    res.status(200).send(filteredProducts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Create Product
productsRoutes.post("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    try {
      const product = new Product(req.body);
      if (req.body.stocks) {
        const stocks = await Stocks.insertMany(req.body.stocks);
        product.stocks = stocks.map((stock) => stock._id);
      }
      if (req.body.categories) {
        const categories = await Category.insertMany(req.body.categories);
        product.categories = categories.map((category) => category._id);
      }
      await product.save();
      res.status(201).send(product);
    } catch (error) {
      res.status(500).send(error.message);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default productsRoutes;
