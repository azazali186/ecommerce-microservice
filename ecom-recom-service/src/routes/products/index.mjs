import Product from "../../models/product.mjs";
import express from "express";
const productsRoutes = express.Router();
import { esClient } from "../../config/esClient";
import {
  getPastProductsForUser,
  getRecommandedProducts,
  trainTensorFlowModel,
} from "../../utils/trainTensorFlowModel.mjs";
import tf from "@tensorflow/tfjs-node";
import { requestProducts } from "../rabbitMq/requestProducts.mjs";
import { createProductData, updateEs } from "../../utils/index.mjs";

// Create a new product in PostgreSQL and index it in Elasticsearch
productsRoutes.post("/products", async (req, res) => {
  const { productId, name, description, intraction, userId } = req.body;
  // Save product to PostgreSQL & Elasticsearch
  const product = createProductData(
    productId,
    name,
    description,
    intraction,
    userId
  );
  res.json(product);
});

// Update product details in PostgreSQL and Elasticsearch

productsRoutes.patch("/products/:id", async (req, res) => {
  const pId = req.params.id;
  const { productId, name, description } = req.body;

  // Update product in PostgreSQL
  let updatedProduct;
  try {
    await Product.update(
      { productId, name, description },
      { where: { id: pId } }
    );
    updatedProduct = await Product.findByPk(pId);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error updating product in PostgreSQL." });
  }

  // Update product in Elasticsearch

  await updateEs(pId, "products", updatedProduct);


  // Re-train/update your TensorFlow model (hypothetical function)
  try {
    await trainTensorFlowModel();
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error retraining the recommendation model." });
  }

  res.json({ message: "Product updated successfully!" });
});

productsRoutes.get("/recommendations/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID provided." });
  }

  let pastProducts;
  try {
    // 1. Fetch the user's historical data or preferences
    pastProducts = await getPastProductsForUser(userId); // hypothetical function
  } catch (error) {
    console.error("Error fetching past products:", error);
    return res.status(500).json({ error: "Failed to fetch past products." });
  }

  let predictions;
  try {
    // 2. Pass user's data into a trained TensorFlow model
    const inputTensor = tf.tensor([pastProducts]);
    predictions = model.predict(inputTensor); // 'model' is your loaded TensorFlow model
  } catch (error) {
    console.error("Error predicting with the model:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate recommendations." });
  }

  let recommendedProductIds;
  try {
    // 3. Get the predicted products or scores
    recommendedProductIds = getTopPredictedProductIds(predictions); // hypothetical function
  } catch (error) {
    console.error("Error extracting top predicted products:", error);
    return res
      .status(500)
      .json({ error: "Failed to extract top product recommendations." });
  }

  let recommendedProducts;
  try {
    // 4. Fetch detailed data for the top recommended products
    recommendedProducts = await Product.findAll({
      where: { id: recommendedProductIds },
    });
    const results = recommendedProducts.map((product) => product.productId);

    recommendedProducts = requestProducts({
      productIds: results,
    });
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return res.status(500).json({ error: "Failed to fetch product details." });
  }

  return res.json({ recommendations: recommendedProducts });
});

productsRoutes.get("/recommended/:userId", async (req, res) => {
  const userId = req.params.userId;

  const recommendedProducts = await getRecommandedProducts(userId, 15);

  return res.json({ recommendations: recommendedProducts });
});

export default productsRoutes;
