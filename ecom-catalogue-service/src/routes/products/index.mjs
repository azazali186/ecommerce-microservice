import { verifyTokenAndAuthorization } from "../../middleware/verifyToken.mjs";
import Product from "../../models/product.mjs";

import express from "express";
import Stocks from "../../models/stocks.mjs";
import Category from "../../models/category.mjs";
import { paginate } from "../../utils/index.mjs";
import { sendProductForES } from "../../rabbitMq/sendProductForES.mjs";
import Translation from "../../models/translation.mjs";
import ProductMetaData from "../../models/productMetaData.mjs";
import ProductPrices from "../../models/productPrice.mjs";
import Variations from "../../models/variations.mjs";
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

    if (product.translation && product.translation.length > 0) {
      const translation = product.translation[0];

      const productData = {
        productId: product.id,
        name: translation.name,
        description: translation.description,
        intraction: "views",
        userId: req.user.id,
      };

      await sendProductForES(productData);
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const createQueryFilter = (req) => {
  const { category, sku, title } = req.query;
  let filter = {};
  filter["isActive"] = true;
  filter["categories.isActive"] = true;

  filter["$or"] = [{ "stocks.quantity": { $gt: 0 } }, { quantity: { $gt: 0 } }];

  if (category) filter["categories.name"] = category;
  if (title) filter["translations.name"] = new RegExp(title, "i");
  if (sku) filter["sku"] = new RegExp(sku, "i");

  return filter;
};

// Usage in your route
productsRoutes.get(
  "/",
  paginate(Product, ["stocks", "translations", "categories"]),
  (req, res) => {
    try {
      req.query.filter = createQueryFilter(req);
      res.status(200).send(req.paginatedResults);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

// Create Product
productsRoutes.post("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    try {
      const product = new Product(req.body).save();
      if (req.body.stocks) {
        const stocks = [];
        req.body.stocks.map(async (s) => {
          s.productId = product._id;
          const stock = new Stocks(s).save();
          if (s.translations) {
            const translations = await Translation.insertMany(s.translations);
            stock.translation = translations.map(
              (translations) => translations._id
            );
          }
          if (s.prices) {
            s.prices.map((sp) => {
              sp.stockId = stock._id;
            });
            const prices = await ProductPrices.insertMany(s.prices);
            stock.price = prices.map((sp) => sp._id);
          }
          if (s.variation) {
            const variations = [];

            s.variation.map((dv) => {
              const vName = dv.name;
              const vVal = dv.value;
              vVal.map(async (v) => {
                const vd = await Variations({
                  name: vName,
                  value: v,
                }).save();
                variations.push(vd._id);
              });
            });

            stock.variations = variations;
          }
          await stock.save();
          stock.push(stock._id);
          return stock;
        });
        product.stock = stocks;
      }
      if (req.body.translations) {
        const translations = await Translation.insertMany(
          req.body.translations
        );
        product.translation = translations.map(
          (translations) => translations._id
        );
      }
      if (req.body.category) {
        const category = await Category.insertMany(req.body.category);
        product.categories = category.map((cat) => cat._id);
      }
      if (req.body.metas) {
        req.body.metas.map((m) => {
          m.productId = product._id;
          return m;
        });
        const metas = await ProductMetaData.insertMany(req.body.metas);
        product.meta = metas.map((meta) => meta._id);
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
