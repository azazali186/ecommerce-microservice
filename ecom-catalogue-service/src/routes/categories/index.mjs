import {
    verifyTokenAndAuthorization
} from "../../middleware/verifyToken.mjs";
import Category from "../../models/category.mjs";

import express from 'express';
const categoriesRoutes = express.Router()

// Update Category
categoriesRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedCategory = await Category.update(
            req.body,
            {
                where: { id: req.params.id },
                returning: true, // To get the updated record
            }
        );

        if (updatedCategory[0] === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        const category = updatedCategory[1][0].toJSON();

        res.status(200).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Category
categoriesRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const deletedCount = await Category.destroy({
            where: { id: req.params.id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Category by ID
categoriesRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const getCategory = await Category.findById(req.params.id);

        if (!getCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        const category = getCategory.toJSON();

        res.status(200).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Categorys
categoriesRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const { new: isNew } = req.query;

    try {
        const category = isNew
            ? await Category.find({ limit: 1, order: [['createdAt', 'DESC']] })
            : await Category.find();

        res.status(200).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Category
categoriesRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        let existingCategory = await Category.findOne({
            where: {code: req.body.code.toUpperCase() }
        });

        if (existingCategory) {
            return res.status(409).json({ error: "Category Code Already Exists." });
        }

        existingCategory = await Category.findOne({
            where: {dial: req.body.dialCode.toUpperCase() }
        });

        if (existingCategory) {
            return res.status(409).json({ error: "Category Dial Code Already Exists." });
        }

        const newCategory = await Category.create({
            name: req.body.name.toLowerCase(),
            code: req.body.code.toUpperCase(),
            dial: req.body.dialCode,
        });

        res.status(201).json(newCategory.toJSON());

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default categoriesRoutes;