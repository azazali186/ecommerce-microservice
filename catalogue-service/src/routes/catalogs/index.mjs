import {
    verifyTokenAndAuthorization
} from "../../middleware/verifyToken.mjs";
import Catalog from "../../models/catalog.mjs";

import express from 'express';
const catalogsRoutes = express.Router()

// Update Catalog
catalogsRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedCatalog = await Catalog.update(
            req.body,
            {
                where: { id: req.params.id },
                returning: true, // To get the updated record
            }
        );

        if (updatedCatalog[0] === 0) {
            return res.status(404).json({ message: "Catalog not found" });
        }

        const catalog = updatedCatalog[1][0].toJSON();

        res.status(200).json(catalog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Catalog
catalogsRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const deletedCount = await Catalog.destroy({
            where: { id: req.params.id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Catalog not found" });
        }

        res.status(200).json({ message: "Catalog deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Catalog by ID
catalogsRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const getCatalog = await Catalog.findById(req.params.id);

        if (!getCatalog) {
            return res.status(404).json({ message: "Catalog not found" });
        }

        const catalog = getCatalog.toJSON();

        res.status(200).json(catalog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Catalogs
catalogsRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const { new: isNew } = req.query;

    try {
        const catalog = isNew
            ? await Catalog.find({ limit: 1, order: [['createdAt', 'DESC']] })
            : await Catalog.find();

        res.status(200).json(catalog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Catalog
catalogsRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        let existingCatalog = await Catalog.findOne({
            where: {code: req.body.code.toUpperCase() }
        });

        if (existingCatalog) {
            return res.status(409).json({ error: "Catalog Code Already Exists." });
        }

        existingCatalog = await Catalog.findOne({
            where: {dial: req.body.dialCode.toUpperCase() }
        });

        if (existingCatalog) {
            return res.status(409).json({ error: "Catalog Dial Code Already Exists." });
        }

        const newCatalog = await Catalog.create({
            name: req.body.name.toLowerCase(),
            code: req.body.code.toUpperCase(),
            dial: req.body.dialCode,
        });

        res.status(201).json(newCatalog.toJSON());

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default catalogsRoutes;