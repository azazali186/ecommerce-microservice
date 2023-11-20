import tf from "@tensorflow/tfjs-node";
import User from "../models/user.mjs";
import Product from "../models/product.mjs";
import Intraction from "../models/intraction.mjs";

import { db } from "../config/db.js";
import { Op } from "sequelize";
import { requestProducts } from "../rabbitMq/requestProducts.mjs";

export const WEIGHTS = {
  views: 1,
  like: 2,
  add_to_cart: 3,
  add_to_wishlist: 4,
  purchased: 5,
};

const saveEmbeddingsToMongo = async (embeddings, collectionName) => {
  // Convert tf.Tensor to a JavaScript array
  const embeddingsArray = embeddings.arraySync();
  if (!db) {
    console.error("Database not initialized");
    return;
  }
  const collection = db.collection(collectionName);
  await collection.insertOne({ data: embeddingsArray });
};

export const getIntractionValue = async (intraction) => {
  return (await WEIGHTS[intraction]) || 0;
};

const createUserItemMatrix = async (userId) => {
  const intractions = await Intraction.findAll();
  const users = await User.findAll({ where: { userId: userId } });
  const products = await Product.findAll();

  // Initialize a matrix with zeros
  const matrix = Array(users.length)
    .fill(null)
    .map(() => Array(products.length).fill(0));

  intractions.forEach(async (intraction) => {
    const userIndex = users.findIndex((u) => u.userId === intraction.userId);
    const productIndex = products.findIndex(
      (p) => p.id === intraction.productId
    );
    // console.log("User Index:", userIndex, "Product Index:", productIndex);

    const weight = await getIntractionValue(intraction.type);

    if (!isNaN(weight) && userIndex !== -1 && productIndex !== -1) {
      matrix[userIndex][productIndex] += weight;
    } else {
      // console.error("Invalid interaction:", intraction);
    }
  });

  return matrix;
};

const trainRecommendationModel = async (
  matrix,
  embeddingSize = 50,
  learningRate = 0.01,
  epochs = 1000
) => {
  // Input validation
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    throw new Error("Invalid matrix");
  }

  // Create a TensorFlow tensor from the input matrix
  const tensor = tf.tensor(matrix);
  console.log("Matrix Dimensions:", tensor.shape);

  // Initialize user and product embeddings with random normal distributions
  const userEmbeddings = tf.variable(
    tf.randomNormal([matrix.length, embeddingSize])
  );
  const productEmbeddings = tf.variable(
    tf.randomNormal([embeddingSize, matrix[0].length])
  );

  // Configure the optimizer with the specified learning rate
  const optimizer = tf.train.sgd(learningRate);

  // Training loop
  for (let epoch = 0; epoch < epochs; epoch++) {
    optimizer.minimize(() => {
      // Predictions based on user and product embeddings
      const predicted = tf.matMul(userEmbeddings, productEmbeddings);

      // Calculate mean squared error loss
      const loss = tf.losses.meanSquaredError(tensor, predicted);

      // Log the training progress
      // console.log("Epoch:", epoch, "Loss:", loss.dataSync()[0]);

      return loss;
    });
  }

  console.log("Training complete.");

  // Return the trained user and product embeddings
  return { userEmbeddings, productEmbeddings };
};

const getRecommendationsForUser = (
  userEmbedding,
  productEmbeddings,
  topN = 10
) => {
  if (!userEmbedding || !productEmbeddings) {
    throw new Error("User or product embeddings are null");
  }

  const predictions = tf.matMul(userEmbedding, productEmbeddings);
  const values = predictions.dataSync();

  return Array.from(values)
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN)
    .map((item) => item.index);
};

export const getRecommandedProducts = async (userId = null, topN = 10) => {
  const matrix = await createUserItemMatrix(userId);
  const { userEmbeddings, productEmbeddings } = await trainRecommendationModel(
    matrix
  );
  // const recommendations = getRecommendationsForUser(userEmbeddings, productEmbeddings);
  const productIndexIds = getRecommendationsForUser(
    userEmbeddings,
    productEmbeddings,
    topN
  );

  const productsData = await Product.findAll();

  const productIds = [];

  productIndexIds.forEach((p) => {
    const product = productsData[p];
    productIds.push(product.productId);
  });

  console.log("productIndexIds  ", productIndexIds);

  if (productIds) {
    console.log("requestProducts started  ");
    const products = await requestProducts({
      productIds: productIds,
    });
    console.log("requestProducts ended  ");
    return products;
  }
  return results;
};

export const trainTensorFlowModel = async () => {
  const users = await User.findAll();
  const products = await Product.findAll();
  const intractions = await Intraction.findAll();

  const numUsers = users.length;
  const numProducts = products.length;
  const numIntraction = intractions.length;

  const userIDs = users.map((user) => user.id);
  const productIDs = products.map((product) => product.id);
  const intractionIDs = intractions.map((intraction) => intraction.id);

  // Create a 2D tensor for user-product intractions, initialized with zeros
  const intractionMatrix = tf.tensor2d(
    new Array(numUsers).fill(null).map((row) => new Array(numProducts).fill(0)),
    [numUsers, numProducts]
  );

  // Populate the intraction matrix based on the intractions in the database
  intractions.forEach((intraction) => {
    const userIndex = userIDs.indexOf(intraction.userId);
    const productIndex = productIDs.indexOf(intraction.productId);
    intractionMatrix
      .bufferSync()
      .set(intraction.rating, userIndex, productIndex);
  });

  // Matrix factorization
  const embeddingSize = 50; // Adjust as necessary
  const userEmbeddings = tf.variable(
    tf.randomNormal([numUsers, embeddingSize])
  );
  const productEmbeddings = tf.variable(
    tf.randomNormal([numProducts, embeddingSize])
  );

  const optimizer = tf.train.sgd(0.1);
  for (let epoch = 0; epoch < 1000; epoch++) {
    optimizer.minimize(() => {
      const predictedInteraction = tf.dot(
        userEmbeddings,
        productEmbeddings.transpose()
      );

      const loss = tf.losses.meanSquaredError(
        intractionMatrix,
        predictedInteraction
      );
      return loss;
    });
  }
  await saveEmbeddingsToMongo(userEmbeddings, "userEmbeddings");
  await saveEmbeddingsToMongo(productEmbeddings, "productEmbeddings");
};

export const getPastProductsForUser = async (userId) => {
  // Validation: Check if userId is provided and is of a valid type (e.g., number)
  if (!userId) {
    throw new Error("Invalid or missing userId.");
  }

  try {
    // Fetch intractions for a specific user where the intraction type is 'purchased'
    const intractions = await Intraction.findAll({
      where: { userId: userId, type: "purchased" },
      include: Product, // Join with products to get product details
    });

    // Extract product details from the intractions
    const pastProducts = intractions.map((intraction) => intraction.Product);

    return pastProducts;
  } catch (error) {
    console.error("Error fetching past products:", error);
    throw new Error("Failed to fetch past products for the user."); // Propagate the error to caller
  }
};

export const getTopPredictedProductIds = (predictions, topN = 10) => {
  // Error handling: Check if predictions is a tensor
  if (!predictions instanceof tf.Tensor) {
    throw new Error("Predictions must be a TensorFlow tensor.");
  }

  // Error handling: Check if predictions tensor is 1D
  if (predictions.shape.length !== 1) {
    throw new Error("Predictions tensor must be 1D.");
  }

  // Convert tensor to array
  const predictionArray = predictions.arraySync();

  // Error handling: Ensure valid topN value
  if (typeof topN !== "number" || topN <= 0 || topN > predictionArray.length) {
    throw new Error(
      `Invalid topN value: ${topN}. It should be a positive number less than or equal to the length of predictions.`
    );
  }

  // Get topN indices based on prediction values
  const topIndices = predictionArray
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN)
    .map((item) => item.index + 1); // +1 because we assume product IDs start from 1

  return topIndices;
};
