import {
    verifyTokenAndAuthorization
} from "../../middleware/verifyToken.mjs";
import Currency from "../../models/currency.mjs";

import express from 'express';
const currenciesRoutes = express.Router()

// Update Currency
currenciesRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedCurrency = await Currency.update(
            req.body,
            {
                where: { id: req.params.id },
                returning: true, // To get the updated record
            }
        );

        if (updatedCurrency[0] === 0) {
            return res.status(404).json({ message: "Currency not found" });
        }

        const currency = updatedCurrency[1][0].toJSON();

        res.status(200).json(currency);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Currency
currenciesRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const deletedCount = await Currency.destroy({
            where: { id: req.params.id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Currency not found" });
        }

        res.status(200).json({ message: "Currency deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Currency by ID
currenciesRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const getCurrency = await Currency.findByPk(req.params.id);

        if (!getCurrency) {
            return res.status(404).json({ message: "Currency not found" });
        }

        const currency = getCurrency.toJSON();

        res.status(200).json(currency);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Currencys
currenciesRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const { new: isNew } = req.query;

    try {
        const currencys = isNew
            ? await Currency.findAll({ limit: 1, order: [['createdAt', 'DESC']] })
            : await Currency.findAll();

        res.status(200).json(currencys);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Currency
currenciesRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const existingCurrency = await Currency.findOne({
            where: { code: req.body.code.toUpperCase() }
        });

        if (existingCurrency) {
            return res.status(409).json({ error: "Currency Code Already Exists." });
        }

        const newCurrency = await Currency.create({
            name: req.body.name.toLowerCase(),
            code: req.body.code.toUpperCase(),
        });

        res.status(201).json(newCurrency.toJSON());

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default currenciesRoutes;