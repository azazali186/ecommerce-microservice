import { verifyTokenAndAuthorization } from "../../middleware/verifyToken.mjs";
import Stock from "../../models/stocks.mjs";

import express from "express";
const stocksRoutes = express.Router();

// Update Stock
stocksRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedStock = await Stock.update(req.body, {
      where: { id: req.params.id },
      returning: true, // To get the updated record
    });

    if (updatedStock[0] === 0) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const stock = updatedStock[1][0].toJSON();

    res.status(200).json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Stock
stocksRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const deletedCount = await Stock.destroy({
      where: { id: req.params.id },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.status(200).json({ message: "Stock deleted Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get Stock by ID
stocksRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const getStock = await Stock.findByPk(req.params.id);

    if (!getStock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const stock = getStock.toJSON();

    res.status(200).json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

const validateStocksQuery = (req, res, next) => {
  const { page, limit, sku, name } = req.query;

  // Validate page and limit to be positive integers
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return res.status(400).send("Invalid page number.");
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1)) {
    return res.status(400).send("Invalid limit value.");
  }

  // If you have a specific format for SKU, validate it
  if (sku && typeof sku !== "string") {
    return res.status(400).send("Invalid SKU format.");
  }

  // Validate name as a string (if necessary)
  if (name && typeof name !== "string") {
    return res.status(400).send("Invalid name format.");
  }

  next(); // If all validations pass, proceed to the next middleware/route handler
};

// Get All Stocks
stocksRoutes.get(
  "/",
  validateStocksQuery,
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, sku, name } = req.query;
      const pageNumber = parseInt(page, 10);
      const resultsLimit = parseInt(limit, 10);

      const query = {};
      if (sku) query.sku = sku;
      if (name) query.name = new RegExp(name, "i");

      const stocks = await Stock.find(query)
        .skip((pageNumber - 1) * resultsLimit)
        .limit(resultsLimit);
      const total = await Stock.countDocuments(query);

      res.status(200).send({
        data: stocks,
        meta: {
          total: total,
          currentPage: pageNumber,
          totalPages: Math.ceil(total / resultsLimit),
        },
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

// Create Stock
stocksRoutes.post("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const existingStock = await Stock.findOne({
      where: { code: req.body.code.toUpperCase() },
    });

    if (existingStock) {
      return res.status(409).json({ error: "Stock Code Already Exists." });
    }

    const newStock = await Stock.create({
      name: req.body.name.toLowerCase(),
      code: req.body.code.toUpperCase(),
    });

    res.status(201).json(newStock.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default stocksRoutes;
