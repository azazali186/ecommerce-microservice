import {
    verifyTokenAndAuthorization
} from "../../middleware/verifyToken.mjs";
import Country from "../../models/country.mjs";

import express from 'express';
const countriesRoutes = express.Router()
import { Op } from 'sequelize';

// Update Country
countriesRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedCountry = await Country.update(
            req.body,
            {
                where: { id: req.params.id },
                returning: true, // To get the updated record
            }
        );

        if (updatedCountry[0] === 0) {
            return res.status(404).json({ message: "Country not found" });
        }

        const country = updatedCountry[1][0].toJSON();

        res.status(200).json(country);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Country
countriesRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const deletedCount = await Country.destroy({
            where: { id: req.params.id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Country not found" });
        }

        res.status(200).json({ message: "Country deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Country by ID
countriesRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const getCountry = await Country.findByPk(req.params.id);

        if (!getCountry) {
            return res.status(404).json({ message: "Country not found" });
        }

        const country = getCountry.toJSON();

        res.status(200).json(country);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Countrys
countriesRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const { new: isNew } = req.query;

    try {
        const countrys = isNew
            ? await Country.findAll({ limit: 1, order: [['createdAt', 'DESC']] })
            : await Country.findAll();

        res.status(200).json(countrys);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Country
countriesRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        let existingCountry = await Country.findOne({
            where: {code: req.body.code.toUpperCase() }
        });

        if (existingCountry) {
            return res.status(409).json({ error: "Country Code Already Exists." });
        }

        existingCountry = await Country.findOne({
            where: {dial: req.body.dialCode.toUpperCase() }
        });

        if (existingCountry) {
            return res.status(409).json({ error: "Country Dial Code Already Exists." });
        }

        const newCountry = await Country.create({
            name: req.body.name.toLowerCase(),
            code: req.body.code.toUpperCase(),
            dial: req.body.dialCode,
        });

        res.status(201).json(newCountry.toJSON());

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default countriesRoutes;